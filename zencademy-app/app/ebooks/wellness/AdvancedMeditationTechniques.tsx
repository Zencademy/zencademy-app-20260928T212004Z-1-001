import React from 'react';
import { EbookReader } from '../../../components/ebooks/EbookReader';
import { getEbookContent } from '../../../lib/ebookContent/catalog';

export default function AdvancedMeditationTechniques() {
  const ebook = getEbookContent('3')!;
  return <EbookReader title={ebook.title} chapters={ebook.chapters} />;
}
