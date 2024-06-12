// generatePDFMiddleware.js

const PDFDocument = require('pdfkit')

const generatePDF = (contactInfoData) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4' }) // Set size to A4
    let buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers)
      resolve(pdfData)
    })

    // Set font size and color for the title
    doc
      .fontSize(25)
      .fillColor('blue')
      .text('Contact Information', { align: 'center' })

    // Set font size and color for the contact information
    doc.fontSize(14).fillColor('black')

    let yPosition = 100

    doc.text('Phone:', 50, yPosition)
    doc.text(contactInfoData.phone, 200, yPosition)

    yPosition += 20

    doc.text('Address:', 50, yPosition)
    doc.text(contactInfoData.address, 200, yPosition)

    yPosition += 20

    doc.text('Email:', 50, yPosition)
    doc.text(contactInfoData.email, 200, yPosition)

    yPosition += 20

    doc.text('LinkedIn:', 50, yPosition)
    doc.text(contactInfoData.linkedin, 200, yPosition)

    yPosition += 20

    doc.text('GitHub:', 50, yPosition)
    doc.text(contactInfoData.github, 200, yPosition)

    doc.end()
  })
}

const generatePDFMiddleware = async (req, res, next) => {
  try {
    // Generate PDF using the attached contact information
    const pdfBuffer = await generatePDF(req.contactInfoData)

    // Attach PDF buffer to request object
    req.pdfBuffer = pdfBuffer
    next()
  } catch (error) {
    console.error('Error generating PDF:', error)
    res.status(500).json({ message: 'Error generating PDF' })
  }
}

module.exports = generatePDFMiddleware
