import React from 'react';
import { EbookReader } from '../../../components/ebooks/EbookReader';
import { getEbookContent } from '../../../lib/ebookContent/catalog';

export default function StressManagement() {
  const ebook = getEbookContent('2')!;
  return <EbookReader title={ebook.title} chapters={ebook.chapters} />;
}
