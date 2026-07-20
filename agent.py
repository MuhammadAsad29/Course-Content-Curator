import openai
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re
from search import aggregate_all_resources

load_dotenv()

class CourseAgent:
    def __init__(self):
        self.model = "gpt-5.2"
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def extract_subtopics(self, topic):
        """Break topic into subtopics"""
        prompt = f"""
        Topic: {topic}
        
        Break this into 5-7 progressive subtopics for a beginner.
        Return as JSON list only:
        ["subtopic1", "subtopic2", ...]
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return [topic]
    
    def rank_resources(self, topic, resources):
        """Rank resources by quality"""
        prompt = f"""
        Topic: {topic}
        
        Resources found:
        {json.dumps(str(resources), indent=2)[:1000]}
        
        Return top 10 best resources as JSON:
        {{"top_resources": [{{"url": "...", "source": "...", "reason": "..."}}]}}
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return {"top_resources": []}
    
    def create_roadmap(self, topic, subtopics):
        """Generate 4-week learning roadmap"""
        prompt = f"""
        Topic: {topic}
        Subtopics: {subtopics}
        
        Create a 4-week learning roadmap with daily goals.
        Return as JSON only:
        {{"weeks": [{{"week": 1, "goals": ["goal1", "goal2"]}}]}}
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return {"weeks": []}
    
    def curate_course(self, topic):
        """Main function - curate entire course"""
        # Get resources
        resources = aggregate_all_resources(topic)
        
        try:
            # Extract subtopics
            subtopics = self.extract_subtopics(topic)
            
            # Rank resources
            ranked = self.rank_resources(topic, resources)
            
            # Create roadmap
            roadmap = self.create_roadmap(topic, subtopics)
            
            # If LLM returned default fallback lists (single item list), raise to trigger fallback
            if len(subtopics) <= 1 and (not isinstance(ranked, dict) or not ranked.get("top_resources")):
                raise ValueError("LLM returned empty or default values")
                
        except Exception as e:
            print(f"LLM Generation failed: {e}. Generating course content via fallback...")
            subtopics = [
                f"Introduction to {topic}",
                f"Core Concepts of {topic}",
                f"Intermediate Techniques in {topic}",
                f"Practical Projects with {topic}",
                f"Summary & Next Steps in {topic}"
            ]
            
            # Map aggregated resources to top_resources format
            top_res = []
            if isinstance(resources, dict):
                # Process web URLs
                for url in resources.get('web', []):
                    top_res.append({"url": url, "source": "Web Search", "reason": f"Popular introduction to {topic}."})
                # Process YouTube videos
                for video in resources.get('youtube', []):
                    if isinstance(video, dict):
                        top_res.append({"url": video.get('url', ''), "source": "YouTube", "reason": f"Video tutorial: {video.get('title', '')}."})
                # Process Medium articles
                for item in resources.get('medium', []):
                    if isinstance(item, dict):
                        top_res.append({"url": item.get('url', ''), "source": "Medium", "reason": "Written guide on Medium."})
                # Process Dev.to articles
                for item in resources.get('devto', []):
                    if isinstance(item, dict):
                        top_res.append({"url": item.get('url', ''), "source": "Dev.to", "reason": "Developer tutorial on Dev.to."})
            
            # Suggest ALL distinct resources instead of slicing to [:3]
            ranked = {"top_resources": top_res if top_res else [
                {"url": f"https://www.google.com/search?q={topic.replace(' ', '+')}", "source": "Google Search", "reason": "Search query results."}
            ]}
            
            # Extract number of weeks from topic (e.g. "15 weeks" -> 15)
            match = re.search(r'(\d+)\s*week', topic, re.IGNORECASE)
            num_weeks = int(match.group(1)) if match else 4
            
            # Dynamically generate weeks roadmap and distribute resources into it
            weeks = []
            for w in range(1, num_weeks + 1):
                subtopic_for_week = subtopics[(w - 1) % len(subtopics)]
                
                goals = [
                    f"Focus area: {subtopic_for_week}",
                    f"Read articles and study documentation on this week's focus."
                ]
                
                # Assign resources sequentially to the weeks
                if top_res:
                    res_for_week = top_res[(w - 1) % len(top_res)]
                    goals.append(f"Explore resource: {res_for_week['url']} ({res_for_week['source']})")
                
                weeks.append({
                    "week": w,
                    "goals": goals
                })
                
            roadmap = {"weeks": weeks}
        
        return {
            "topic": topic,
            "subtopics": subtopics,
            "resources": ranked,
            "roadmap": roadmap
        }