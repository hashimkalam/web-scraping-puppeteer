"use client";
import { useState } from "react";

function Form() {
  const [url, setUrl] = useState<string>("");
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    headings: string[];
    paragraphs: string[];
    links: { text: string; href: string }[];
    images: { src: string; alt: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to scrape the website");
      }

      const data = await response.json();
      setScrapedData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Website Scraper</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          required
          className="border p-2 w-full mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Scrape Website
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {scrapedData && (
        <div>
          <h2 className="text-xl font-bold">Scraped Data</h2>
          <p>
            <strong>Title:</strong> {scrapedData.title}
          </p>
          <h3 className="mt-4 font-bold">Headings:</h3>
          <ul className="list-disc pl-5">
            {scrapedData.headings.map((heading, index) => (
              <li key={index}>{heading}</li>
            ))}
          </ul>
          <h3 className="mt-4 font-bold">Paragraphs:</h3>
          <ul className="list-disc pl-5">
            {scrapedData.paragraphs.map((para, index) => (
              <li key={index}>{para}</li>
            ))}
          </ul>
          <h3 className="mt-4 font-bold">Links:</h3>
          <ul className="list-disc pl-5">
            {scrapedData.links.map((link, index) => (
              <li key={index}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-bold">Images:</h3>
          <div className="grid grid-cols-2 gap-4">
            {scrapedData.images.map((image, index) => (
              <div key={index} className="flex flex-col items-center">
                <img src={image.src} alt={image.alt} className="w-full h-auto" />
                <span className="mt-2">{image.alt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Form;
