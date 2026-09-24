import { useEffect } from "react";

const SITE_NAME = "Asim Vokshi";
const BASE_URL = "https://asimvokshi.edu.al";
const DEFAULT_IMAGE = `${BASE_URL}/images/building_front.jpeg`;
const PAGE_IMAGES: Record<string, string> = {
  "/": "/images/asim_vokshi_facade.jpeg",
  "/rreth-nesh": "/images/asim_vokshi_portrait.png",
  "/infrastruktura": "/images/infrastructure_biochemistry_lab.jpg",
  "/lajme": "/images/building_front.jpeg",
  "/kontakt": "/images/asim_vokshi_facade.jpeg",
};

interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function toAbsoluteUrl(value: string): string {
  return value.startsWith("http") ? value : `${BASE_URL}${value}`;
}

export function useSeo({ title, description, path = "/", image }: SeoOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `${BASE_URL}${path}`;
    const socialImage = toAbsoluteUrl(image ?? PAGE_IMAGES[path] ?? DEFAULT_IMAGE);

    document.title = fullTitle;

    setMeta("description", description);
    setMeta("robots", "index, follow");

    setMeta("og:type", "website", "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:url", url, "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:image", socialImage, "property");
    setMeta("og:image:alt", title, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:url", url);
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", socialImage);
    setMeta("twitter:image:alt", title);

    setLink("canonical", url);

    let structuredData = document.querySelector<HTMLScriptElement>("script#school-structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "school-structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "School",
      name: "Shkolla e Mesme me Orientim Gjuhësor Asim Vokshi",
      alternateName: "Gjimnazi Asim Vokshi",
      url: BASE_URL,
      image: socialImage,
      description: "Shkollë e mesme me orientim gjuhësor në Tiranë, themeluar në vitin 1965.",
      foundingDate: "1965",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rruga Elbasanit, Njësia Bashkiake Nr. 2",
        addressLocality: "Tiranë",
        addressCountry: "AL",
      },
      email: "shavokshi@yahoo.com",
      sameAs: [
        "https://www.facebook.com/p/Gjimnazi-me-orientim-gjuh%C3%ABsor-Asim-Vokshi-Faqja-zyrtare-100079922222899/",
        "https://www.instagram.com/gjuhet_e_huaja_asim_vokshi/",
      ],
    });
  }, [title, description, path, image]);
}
