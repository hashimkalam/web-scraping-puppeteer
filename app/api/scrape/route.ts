import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import https from 'https';
import http from 'http';

// Helper function to fetch HTML from the given URL
const fetchHTML = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });

      response.on('error', (err) => {
        reject(err);
      });
    });
  });
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch HTML from the given URL
    const html = await fetchHTML(url);

    // Parse HTML using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract title
    const title = document.querySelector('title')?.textContent || 'No title found';

    // Extract headings (h1, h2, h3, h4, h5, h6)
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
      (el) => el.textContent
    );

    // Extract paragraphs (p)
    const paragraphs = Array.from(document.querySelectorAll('p')).map(
      (el) => el.textContent
    );

    // Extract links (a[href])
    const links = Array.from(document.querySelectorAll('a[href]')).map((el) => ({
      text: el.textContent,
      href: el.getAttribute('href'),
    }));

    // Extract images (img[src])
    const images = Array.from(document.querySelectorAll('img[src]')).map((el) => ({
      src: el.getAttribute('src'),
      alt: el.getAttribute('alt') || 'No alt text',
    }));

    // Return the scraped data
    return NextResponse.json({
      title,
      headings,
      paragraphs,
      links,
      images,
    });
  } catch (error) {
    console.error('Error scraping website:', error);
    return NextResponse.json({ error: 'Failed to scrape the website' }, { status: 500 });
  }
}
