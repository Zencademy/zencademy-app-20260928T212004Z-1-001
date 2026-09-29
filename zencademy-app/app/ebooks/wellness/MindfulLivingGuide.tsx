import React from 'react';
import { EbookReader } from '../../../components/ebooks/EbookReader';
import { getEbookContent } from '../../../lib/ebookContent/catalog';

/** Thin route wrapper — content lives in the shared catalog. */
export default function MindfulLivingGuide() {
  const ebook = getEbookContent('1')!;
  return <EbookReader title={ebook.title} chapters={ebook.chapters} />;
}
