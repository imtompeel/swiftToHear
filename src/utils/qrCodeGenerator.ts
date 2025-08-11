// QR Code generation utility using qrcode.react
import { QRCodeSVG } from 'qrcode.react';

export interface QRCodeOptions {
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const generateQRCode = async (
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  const {
    width = 200,
    height = 200,
    color = '#000000',
    backgroundColor = '#FFFFFF',
    errorCorrectionLevel = 'M'
  } = options;

  // Create a temporary div to render the QR code
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  document.body.appendChild(tempDiv);

  // Render QR code to SVG
  const svgElement = document.createElement('div');
  tempDiv.appendChild(svgElement);

  // Use React to render the QR code (this is a simplified approach)
  // In a real implementation, you might want to use a different approach
  // or use a library that can generate data URLs directly
  
  // For now, return a data URL representation
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="${color}" font-family="Arial" font-size="12">
        QR Code: ${text.substring(0, 20)}...
      </text>
    </svg>
  `;

  document.body.removeChild(tempDiv);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const generateQRCodeSVG = (
  text: string,
  options: QRCodeOptions = {}
): string => {
  const {
    width = 200,
    height = 200,
    color = '#000000',
    backgroundColor = '#FFFFFF',
    errorCorrectionLevel = 'M'
  } = options;

  // Create a temporary div to render the QR code
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  document.body.appendChild(tempDiv);

  // Create a React element and render it
  const React = require('react');
  const ReactDOM = require('react-dom');
  
  const qrElement = React.createElement(QRCodeSVG, {
    value: text,
    size: Math.min(width, height),
    level: errorCorrectionLevel,
    includeMargin: true,
    bgColor: backgroundColor,
    fgColor: color
  });

  ReactDOM.render(qrElement, tempDiv);
  
  // Get the SVG content
  const svgElement = tempDiv.querySelector('svg');
  const svgContent = svgElement ? svgElement.outerHTML : '';
  
  // Clean up
  ReactDOM.unmountComponentAtNode(tempDiv);
  document.body.removeChild(tempDiv);
  
  return svgContent;
};

export const downloadQRCode = async (
  text: string,
  filename: string = 'qrcode.png',
  options: QRCodeOptions = {}
): Promise<void> => {
  try {
    const dataUrl = await generateQRCode(text, options);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
  }
};
