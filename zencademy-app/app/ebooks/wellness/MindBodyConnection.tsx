import React from 'react';
import { EbookReader } from '../../../components/ebooks/EbookReader';
import { getEbookContent } from '../../../lib/ebookContent/catalog';

export default function MindBodyConnection() {
  const ebook = getEbookContent('4')!;
  return <EbookReader title={ebook.title} chapters={ebook.chapters} />;
}
