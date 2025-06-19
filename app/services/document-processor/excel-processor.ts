import { readFile } from 'fs/promises';
import * as XLSX from 'xlsx';

export interface PricingData {
  productName: string;
  unitPrice: number;
  unitType: string;
  category?: string;
  description?: string;
}

interface ExcelRow {
  [key: string]: string | number;
}

export class ExcelProcessor {
  private pricingData: PricingData[] = [];

  async processExcelFile(filePath: string): Promise<PricingData[]> {
    try {
      // Reset pricing data for fresh processing
      this.pricingData = [];
      
      const fileBuffer = await readFile(filePath);
      const workbook: XLSX.WorkBook = XLSX.read(fileBuffer);
      
      // Process each sheet in the workbook
      for (const sheetName of workbook.SheetNames) {
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const data = this.extractPricingData(worksheet);
        this.pricingData = [...this.pricingData, ...data];
      }

      return this.pricingData;
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      throw error;
    }
  }

  private extractPricingData(worksheet: XLSX.WorkSheet): PricingData[] {
    const data: PricingData[] = [];
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    for (const row of jsonData) {
      if (typeof row === 'object' && row !== null) {
        const pricingData: PricingData = {
          productName: String(row['Product Name'] || ''),
          unitPrice: Number(row['Unit Price']) || 0,
          unitType: String(row['Unit Type'] || ''),
          category: row['Category'] ? String(row['Category']) : undefined,
          description: row['Description'] ? String(row['Description']) : undefined
        };
        
        if (pricingData.productName && pricingData.unitPrice) {
          data.push(pricingData);
        }
      }
    }

    return data;
  }

  getPricingData(): PricingData[] {
    return this.pricingData;
  }
} 