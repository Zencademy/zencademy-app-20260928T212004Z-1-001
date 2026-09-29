import React from 'react';
import { EbookReader } from '../../../components/ebooks/EbookReader';
import { getEbookContent } from '../../../lib/ebookContent/catalog';

export default function HolisticHealthWellness() {
  const ebook = getEbookContent('5')!;
  return <EbookReader title={ebook.title} chapters={ebook.chapters} />;
}
