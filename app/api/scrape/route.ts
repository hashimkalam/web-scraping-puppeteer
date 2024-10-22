import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Launch Puppeteer and open a new page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Extract title
    const title = await page.title();

    // Extract headings (h1, h2, h3, h4, h5, h6)
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
      elements.map((el) => el.textContent)
    );

    // Extract paragraphs (p)
    const paragraphs = await page.$$eval('p', (elements) =>
      elements.map((el) => el.textContent)
    );

    // Extract links (a[href])
    const links = await page.$$eval('a[href]', (elements) =>
      elements.map((el) => ({
        text: el.textContent,
        href: el.getAttribute('href'),
      }))
    );

    // Extract images (img[src])
    const images = await page.$$eval('img[src]', (elements) =>
      elements.map((el) => ({
        src: el.getAttribute('src'),
        alt: el.getAttribute('alt') || 'No alt text',
      }))
    );

    // Close Puppeteer browser
    await browser.close();

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
