import React from 'react';
import { EbookReader } from '../../../components/ebooks/EbookReader';
import { getEbookContent } from '../../../lib/ebookContent/catalog';

export default function PhysicalTrainingFundamentals() {
  const ebook = getEbookContent('6')!;
  return <EbookReader title={ebook.title} chapters={ebook.chapters} />;
}
