// The Official Universal Document (UD) Shape
// This guarantees all 200+ engines output the exact same structural object

export interface UniversalDocument {
  id: string; // Cryptographic ID
  sourceEngine: string; // Which engine generated this (e.g. 'ud-contract')
  ownerId: string; // The user who owns this document
  originalFileName: string;
  
  // The normalized, structured output from the engine
  structuredData: Record<string, any>; 
  
  // Metadata about the parsing
  metadata: {
    language: string;
    parsedAt: string;
    wordCount: number;
    aiModelUsed: string;
  };
  
  // Optional: The raw extracted text before structuring (for search indexing)
  rawText?: string; 
}
