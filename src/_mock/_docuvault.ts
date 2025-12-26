export const GB = 1000000000 * 24;
export const FILE_TYPE = [
  'jpg',
  'mp3',
  'mp4',
  'pdf',
  'jpg',
  'jpg',
  'txt',
  'psd',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'zip',
  'rar',
  'iso',
  'ai',
  'esp',
  'ppt',
  'pptx',
  'wav',
  'm4v',
  'jpg',
  'jpg',
  'pdf',
];
export const FILE_NAME = [
  'cover_2.jpg',
  'design_suriname_2015.mp3',
  'expertise_2015_conakry_sao-tome-and-principe_gender.mp4',
  'money-popup-crack.pdf',
  'cover_4.jpg',
  'cover_6.jpg',
  'large_news.txt',
  'nauru-6015-small-fighter-left-gender.psd',
  'tv-xs.doc',
  'gustavia-entertainment-productivity.docx',
  'vintage_bahrain_saipan.xls',
  'indonesia-quito-nancy-grace-left-glad.xlsx',
  'legislation-grain.zip',
  'large_energy_dry_philippines.rar',
  'footer-243-ecuador.iso',
  'kyrgyzstan-04795009-picabo-street-guide-style.ai',
  'india-data-large-gk-chesterton-mother.esp',
  'footer-barbados-celine-dion.ppt',
  'socio_respectively_366996.pptx',
  'socio_ahead_531437_sweden_popup.wav',
  'trinidad_samuel-morse_bring.m4v',
  'cover_12.jpg',
  'cover_18.jpg',
  'xl_david-blaine_component_tanzania_books.pdf',
];
export const _files = FILE_NAME.map((file, index) => ({
  id: `${index}_files`,
  name: file,
  size: GB / ((index + 1) * 500),
  type: FILE_TYPE[index],
  createdAt: new Date(),
  tags: ['Docs', 'Projects', 'Work', 'Training', 'Sport', 'Foods'],
}));
export const _folders = [
  'Case Notes',
  'Meeting Notes',
  'SMS',
  'Disclosures',
  'Email Outreach',
  'Attachments',
].map((folder, index) => {
  const numFiles = Math.floor(Math.random() * _files.length) + 1;
  const files: any[] = [];
  const randomArray = Array.apply(null, Array(numFiles));
  randomArray.forEach(() => {
    const randomIndex = Math.floor(Math.random() * _files.length);
    files.push(_files[randomIndex]);
  });

  return {
    id: `${index}_folders`,
    name: folder,
    type: 'folder',
    files: files,
    totalFiles: 10,
  };
});
