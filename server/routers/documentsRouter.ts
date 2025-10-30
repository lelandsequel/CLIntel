import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { propertyDocuments } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { storagePut } from '../storage';

export const documentsRouter = router({
  /**
   * Upload a document for a property
   */
  upload: publicProcedure
    .input(z.object({
      propertyId: z.number(),
      fileName: z.string(),
      fileContent: z.string(), // base64 encoded
      mimeType: z.string(),
      documentType: z.enum([
        'offering_memo',
        'financial_statement',
        'inspection_report',
        'appraisal',
        'contract',
        'loi',
        'photo',
        'market_analysis',
        'other'
      ]),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Decode base64 content
      const buffer = Buffer.from(input.fileContent, 'base64');
      const fileSize = buffer.length;

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `property-docs/${input.propertyId}/${timestamp}-${randomSuffix}-${input.fileName}`;

      // Upload to S3
      const { url: fileUrl } = await storagePut(
        fileKey,
        buffer,
        input.mimeType
      );

      // Save to database
      const [document] = await db.insert(propertyDocuments).values({
        propertyId: input.propertyId,
        fileName: input.fileName,
        originalFileName: input.fileName,
        fileSize,
        mimeType: input.mimeType,
        documentType: input.documentType,
        fileKey,
        fileUrl,
        description: input.description,
      });

      return {
        success: true,
        documentId: document.insertId,
        fileUrl,
      };
    }),

  /**
   * List documents for a property
   */
  list: publicProcedure
    .input(z.object({
      propertyId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const documents = await db.select()
        .from(propertyDocuments)
        .where(eq(propertyDocuments.propertyId, input.propertyId))
        .orderBy(desc(propertyDocuments.createdAt));

      return documents;
    }),

  /**
   * Delete a document
   */
  delete: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(propertyDocuments)
        .where(eq(propertyDocuments.id, input.id));

      return { success: true };
    }),

  /**
   * Get document types for dropdown
   */
  getDocumentTypes: publicProcedure
    .query(() => {
      return [
        { value: 'offering_memo', label: 'Offering Memorandum' },
        { value: 'financial_statement', label: 'Financial Statement' },
        { value: 'inspection_report', label: 'Inspection Report' },
        { value: 'appraisal', label: 'Appraisal' },
        { value: 'contract', label: 'Contract' },
        { value: 'loi', label: 'Letter of Intent' },
        { value: 'photo', label: 'Photo' },
        { value: 'market_analysis', label: 'Market Analysis' },
        { value: 'other', label: 'Other' },
      ];
    }),
});

