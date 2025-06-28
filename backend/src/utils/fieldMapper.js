// Field mapping utility for consistent naming between frontend and backend

// Convert camelCase to snake_case
export function camelToSnake(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = camelToSnake(value);
  }
  return converted;
}

// Convert snake_case to camelCase
export function snakeToCamel(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    converted[camelKey] = snakeToCamel(value);
  }
  return converted;
}

// Normalize field names for content model
export function normalizeContentFields(data) {
  if (!data) return data;
  
  const fieldMap = {
    // Database field -> Standard field
    'is_active': 'isActive',
    'display_order': 'displayOrder',
    'media_url': 'mediaUrl',
    'qr_code_url': 'qrCodeUrl',
    'created_by': 'createdBy',
    'updated_by': 'updatedBy',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt'
  };
  
  if (Array.isArray(data)) {
    return data.map(item => normalizeContentFields(item));
  }
  
  // Convert Sequelize instance to plain object if needed
  const plainData = data.toJSON ? data.toJSON() : data;
  const normalized = { ...plainData };
  
  // Add both original and mapped fields for compatibility
  for (const [dbField, standardField] of Object.entries(fieldMap)) {
    if (normalized.hasOwnProperty(dbField)) {
      normalized[standardField] = normalized[dbField];
      // Keep original field as well for compatibility
    }
  }
  
  return normalized;
}

// Normalize field names for schedule model
export function normalizeScheduleFields(data) {
  if (!data) return data;
  
  const fieldMap = {
    'start_time': 'startTime',
    'end_time': 'endTime',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    'google_sheet_entry_id': 'googleSheetEntryId'
  };
  
  if (Array.isArray(data)) {
    return data.map(item => normalizeScheduleFields(item));
  }
  
  const normalized = { ...data };
  for (const [dbField, standardField] of Object.entries(fieldMap)) {
    if (normalized.hasOwnProperty(dbField)) {
      normalized[standardField] = normalized[dbField];
      delete normalized[dbField];
    }
  }
  
  return normalized;
}

// Prepare data for database (convert to snake_case)
export function prepareForDatabase(data, modelType = 'general') {
  if (!data) return data;
  
  let converted = camelToSnake(data);
  
  // Model-specific field mappings
  if (modelType === 'content') {
    const contentMap = {
      'isActive': 'is_active',
      'displayOrder': 'display_order',
      'mediaUrl': 'media_url',
      'qrCodeUrl': 'qr_code_url',
      'createdBy': 'created_by',
      'updatedBy': 'updated_by'
    };
    
    for (const [frontend, backend] of Object.entries(contentMap)) {
      if (converted.hasOwnProperty(frontend)) {
        converted[backend] = converted[frontend];
        delete converted[frontend];
      }
    }
  }
  
  return converted;
}

export default {
  camelToSnake,
  snakeToCamel,
  normalizeContentFields,
  normalizeScheduleFields,
  prepareForDatabase
};