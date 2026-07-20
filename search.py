from googlesearch import search
import requests
from youtube_search import YoutubeSearch
import json
import warnings

# Ignore warnings in console logs
warnings.filterwarnings("ignore", category=RuntimeWarning)

def google_web_search(query, num_results=5):
    """Search entire web using google search"""
    try:
        results = search(query, num_results=num_results, lang="en")
        return list(results)
    except Exception as e:
        print(f"Google Search failed: {e}")
        return []

def youtube_search(query, num_results=5):
    """Search YouTube videos"""
    try:
        results = YoutubeSearch(query, max_results=num_results).to_dict()
        videos = []
        for video in results:
            videos.append({
                'title': video['title'],
                'url': f"https://www.youtube.com/watch?v={video['id']}",
                'channel': video['channel'],
                'source': 'YouTube'
            })
        return videos
    except:
        return []

def aggregate_all_resources(topic):
    """Combine all sources in one single Google Search call to avoid 429 blocks"""
    # Fetch 12 results in a single call
    web_urls = google_web_search(topic, num_results=12)
    
    web_results = []
    medium_results = []
    devto_results = []
    
    # Sort them locally
    for url in web_urls:
        if "medium.com" in url:
            medium_results.append({'url': url, 'source': 'Medium'})
        elif "dev.to" in url:
            devto_results.append({'url': url, 'source': 'Dev.to'})
        else:
            web_results.append(url)
            
    # Fallback: if Medium/DevTo lists are empty, populate them with other web search URLs
    # so the frontend cards still show articles
    if not medium_results and len(web_results) > 4:
        medium_results = [{'url': url, 'source': 'Article'} for url in web_results[4:7]]
    if not devto_results and len(web_results) > 7:
        devto_results = [{'url': url, 'source': 'Resource'} for url in web_results[7:10]]
        
    return {
        'web': web_results[:4],
        'youtube': youtube_search(topic, 5),
        'medium': medium_results[:3],
        'devto': devto_results[:3]
    }
