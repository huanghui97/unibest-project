import { renderViewer } from './viewer.mjs'

const pdfUrl = window.location.href.split('?pdfUrl=')[1]
console.log(decodeURIComponent(pdfUrl), 'pdfUrl')
renderViewer(decodeURIComponent(pdfUrl))
