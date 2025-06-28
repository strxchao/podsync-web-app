import SignageContent from '../models/SignageContent.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { normalizeContentFields, prepareForDatabase } from '../utils/fieldMapper.js';

// QR Code generator utility
const generateQRCodeURL = (mediaUrl, size = 300) => {
  if (!mediaUrl) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(mediaUrl)}`;
};

// TEMPORARY FIX: Return raw data to debug field mapping issue
const normalizeContentResponse = (content) => {
  if (!content) return null;
  
  // Convert Sequelize instance to plain object
  const plainContent = content.toJSON ? content.toJSON() : content;
  
  console.log('RAW CONTENT DATA:', {
    id: plainContent.id,
    title: plainContent.title,
    description: plainContent.description,
    type: plainContent.type,
    is_active: plainContent.is_active,
    display_order: plainContent.display_order,
    media_url: plainContent.media_url,
    created_at: plainContent.created_at,
    raw_keys: Object.keys(plainContent)
  });
  
  // Return raw data with minimal processing
  return plainContent;
};

// Fallback content for when database is unavailable
const getFallbackContent = () => [{
  id: 'fallback-1',
  title: 'Welcome to PodSync',
  description: 'The podcast lab digital signage system',
  type: 'announcement',
  mediaUrl: null,
  qrCodeUrl: null,
  displayOrder: 1,
  isActive: true,
  startDate: null,
  endDate: null,
  createdBy: 'system',
  createdAt: new Date(),
  updatedAt: new Date(),
  message: 'Using fallback data - database connection issue'
}];

// FIXED: Get all active content dengan normalization
const getActiveContent = async (req, res) => {
  try {
    console.log('getActiveContent called');
    
    try {
      const content = await SignageContent.findAll({
        where: {
          is_active: true
        },
        order: [
          ['display_order', 'ASC'],
          ['created_at', 'DESC']
        ]
      });

      console.log(`Found ${content.length} active content records`);
      
      if (content.length === 0) {
        console.log('No active content in database, returning sample data');
        return res.json([
          {
            id: 1,
            title: 'Welcome to PodSync',
            description: 'Digital Signage System for Multimedia Studio',
            type: 'announcement',
            isActive: true,
            is_active: true,
            displayOrder: 1,
            mediaUrl: null,
            qrCodeUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            message: 'Sample data - no active content in database yet'
          }
        ]);
      }

      // CRITICAL: Normalize response
      const normalizedContent = normalizeContentResponse(content);
      console.log('Sending normalized active content to frontend');
      res.json(normalizedContent);
      
    } catch (dbError) {
      console.error('Database error in getActiveContent:', dbError.message);
      res.json(normalizeContentResponse(getFallbackContent()));
    }
  } catch (error) {
    console.error('Unexpected error in getActiveContent:', error);
    res.json(normalizeContentResponse(getFallbackContent()));
  }
};

// FIXED: Get all content dengan normalization
const getAllContent = async (req, res) => {
  try {
    console.log('getAllContent called');
    
    try {
      const content = await SignageContent.findAll({
        order: [
          ['display_order', 'ASC'],
          ['created_at', 'DESC']
        ]
      });

      console.log(`Found ${content.length} total content records`);
      
      // CRITICAL: Normalize response untuk frontend
      const normalizedContent = normalizeContentResponse(content);
      
      console.log('Sending normalized response to frontend');
      res.json(normalizedContent);
      
    } catch (dbError) {
      console.error('Database error in getAllContent:', dbError.message);
      res.json(normalizeContentResponse(getFallbackContent()));
    }
  } catch (error) {
    console.error('Error in getAllContent:', error);
    res.status(500).json({
      error: 'Failed to fetch content',
      message: 'System error occurred'
    });
  }
};

// FIXED: Get content by ID dengan normalization
const getContentById = async (req, res) => {
  try {
    console.log(`getContentById called for ID: ${req.params.id}`);
    
    try {
      const content = await SignageContent.findByPk(req.params.id);
      
      if (!content) {
        console.log(`Content with ID ${req.params.id} not found`);
        return res.status(404).json({
          error: 'Content not found',
          message: 'The requested content does not exist'
        });
      }

      console.log(`Found content: ${content.title}`);
      
      // CRITICAL: Normalize response
      const normalizedResponse = normalizeContentResponse(content);
      
      res.json(normalizedResponse);
      
    } catch (dbError) {
      console.error('Database error in getContentById:', dbError.message);
      res.status(500).json({
        error: 'Database error',
        message: 'Unable to fetch the requested content'
      });
    }
  } catch (error) {
    console.error('Error in getContentById:', error);
    res.status(500).json({
      error: 'System error',
      message: 'An error occurred while fetching content'
    });
  }
};

// FIXED: Create new content dengan field mapping yang benar
const createContent = async (req, res) => {
  try {
    console.log('createContent called with data:', req.body);
    
    const {
      title,
      description,
      type,
      mediaUrl,
      displayOrder,
      startDate,
      endDate,
      createdBy,
      isActive  // Frontend mengirim isActive
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Title is required',
        message: 'Please provide a title for the content'
      });
    }

    try {
      // Generate QR code URL if media URL is provided
      const qrCodeUrl = mediaUrl ? generateQRCodeURL(mediaUrl) : null;
      
      console.log('Data yang akan disimpan:');
      console.log(`- title: ${title}`);
      console.log(`- description: ${description}`);
      console.log(`- type: ${type}`);
      console.log(`- mediaUrl: ${mediaUrl}`);
      console.log(`- qrCodeUrl: ${qrCodeUrl}`);
      console.log(`- isActive: ${isActive}`);
      
      // FIXED: Map isActive ke is_active
      const contentData = {
        title: title,
        description: description,
        type: type || 'announcement',
        media_url: mediaUrl || null,
        qr_code_url: qrCodeUrl || null,
        display_order: displayOrder || 0,
        start_date: startDate || null,
        end_date: endDate || null,
        created_by: createdBy || 'system',
        is_active: isActive !== undefined ? Boolean(isActive) : true  // Map dari isActive
      };
      
      console.log('Final data to insert:', contentData);
      
      const content = await SignageContent.create(contentData);

      console.log(`Created new content: ${content.title}`);
      console.log(`Media URL saved: ${content.media_url}`);
      console.log(`QR Code saved: ${content.qr_code_url}`);
      console.log(`Active status: ${content.is_active}`);
      
      // CRITICAL: Normalize response
      const normalizedResponse = normalizeContentResponse(content);
      
      res.status(201).json(normalizedResponse);
      
    } catch (dbError) {
      console.error('Database error in createContent:', dbError.message);
      console.error('Full error:', dbError);
      
      res.status(500).json({
        error: 'Database error',
        message: 'Failed to create content in database',
        details: dbError.message
      });
    }
  } catch (error) {
    console.error('Error in createContent:', error);
    res.status(500).json({
      error: 'Failed to create content',
      message: 'System error occurred'
    });
  }
};

// CRITICAL FIX: Update content dengan proper field mapping dan response
const updateContent = async (req, res) => {
  try {
    console.log(`updateContent called for ID: ${req.params.id}`);
    console.log('Request body:', req.body);
    
    const { id } = req.params;
    const {
      title,
      description,
      type,
      mediaUrl,
      displayOrder,
      startDate,
      endDate,
      isActive  // Frontend mengirim isActive
    } = req.body;

    try {
      const content = await SignageContent.findByPk(id);
      
      if (!content) {
        console.log(`Content with ID ${id} not found for update`);
        return res.status(404).json({
          error: 'Content not found',
          message: 'Cannot update content that does not exist'
        });
      }

      console.log(`Current content "${content.title}" status: ${content.is_active}`);
      console.log(`New status from frontend: ${isActive}`);

      // FIXED: Prepare update data dengan mapping yang benar
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (displayOrder !== undefined) updateData.display_order = displayOrder;
      if (startDate !== undefined) updateData.start_date = startDate;
      if (endDate !== undefined) updateData.end_date = endDate;
      
      // CRITICAL: Handle isActive mapping ke is_active
      if (isActive !== undefined) {
        updateData.is_active = Boolean(isActive);
        console.log(`Setting is_active to: ${updateData.is_active}`);
      }
      
      // Handle media URL dan QR code update
      if (mediaUrl !== undefined) {
        updateData.media_url = mediaUrl;
        updateData.qr_code_url = mediaUrl ? generateQRCodeURL(mediaUrl) : null;
        
        if (mediaUrl) {
          console.log(`QR Code regenerated: ${updateData.qr_code_url}`);
        }
      }

      console.log('Final update data:', updateData);

      // CRITICAL: Update dan reload untuk mendapatkan data terbaru
      await content.update(updateData);
      await content.reload();
      
      console.log(`Updated content: ${content.title}`);
      console.log(`New status in DB: ${content.is_active}`);
      
      // CRITICAL: Normalize response sebelum dikirim ke frontend
      const normalizedResponse = normalizeContentResponse(content);
      
      console.log('Sending normalized response:', {
        id: normalizedResponse.id,
        title: normalizedResponse.title,
        isActive: normalizedResponse.isActive,
        is_active: normalizedResponse.is_active
      });
      
      res.json(normalizedResponse);
      
    } catch (dbError) {
      console.error('Database error in updateContent:', dbError.message);
      console.error('Full db error:', dbError);
      
      res.status(500).json({
        error: 'Database error',
        message: 'Failed to update content in database',
        details: dbError.message
      });
    }
  } catch (error) {
    console.error('Error in updateContent:', error);
    res.status(500).json({
      error: 'Failed to update content',
      message: 'System error occurred'
    });
  }
};

// Delete content
const deleteContent = async (req, res) => {
  try {
    console.log(`deleteContent called for ID: ${req.params.id}`);
    
    const { id } = req.params;
    
    try {
      const content = await SignageContent.findByPk(id);
      
      if (!content) {
        console.log(`Content with ID ${id} not found for deletion`);
        return res.status(404).json({
          error: 'Content not found',
          message: 'Cannot delete content that does not exist'
        });
      }

      await content.destroy();
      console.log(`Deleted content: ${content.title}`);
      res.json({ 
        message: 'Content deleted successfully',
        deletedContent: {
          id: content.id,
          title: content.title
        }
      });
    } catch (dbError) {
      console.error('Database error in deleteContent:', dbError.message);
      res.json({
        message: 'Content marked for deletion in fallback mode - changes will not persist'
      });
    }
  } catch (error) {
    console.error('Error in deleteContent:', error);
    res.status(500).json({
      error: 'Failed to delete content',
      message: 'System error occurred'
    });
  }
};

// Update display order
const updateDisplayOrder = async (req, res) => {
  try {
    console.log('updateDisplayOrder called');
    
    const { orders } = req.body;
    
    if (!Array.isArray(orders)) {
      return res.status(400).json({
        error: 'Invalid orders format',
        message: 'Orders must be an array of {id, displayOrder} objects'
      });
    }

    try {
      await Promise.all(
        orders.map(({ id, displayOrder }) =>
          SignageContent.update(
            { display_order: displayOrder },
            { where: { id } }
          )
        )
      );

      const updatedContent = await SignageContent.findAll({
        order: [['display_order', 'ASC']]
      });

      console.log(`Updated display order for ${orders.length} items`);
      
      // FIXED: Normalize response
      const normalizedContent = normalizeContentResponse(updatedContent);
      res.json(normalizedContent);
      
    } catch (dbError) {
      console.error('Database error in updateDisplayOrder:', dbError.message);
      res.json(
        orders.map(({ id, displayOrder }) => ({
          id,
          displayOrder,
          title: `Content ${id}`,
          message: 'Display order updated in fallback mode - changes will not persist'
        }))
      );
    }
  } catch (error) {
    console.error('Error in updateDisplayOrder:', error);
    res.status(500).json({
      error: 'Failed to update display order',
      message: 'System error occurred'
    });
  }
};

// Get content by creation date range
const getContentByDateRange = async (req, res) => {
  try {
    console.log('getContentByDateRange called');
    
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Both startDate and endDate are required'
      });
    }

    try {
      const content = await SignageContent.findAll({
        where: {
          created_at: {
            [Op.between]: [
              new Date(startDate + ' 00:00:00'),
              new Date(endDate + ' 23:59:59')
            ]
          }
        },
        order: [
          ['created_at', 'DESC'],
          ['display_order', 'ASC']
        ]
      });

      console.log(`Found ${content.length} content items created between ${startDate} and ${endDate}`);
      
      // FIXED: Normalize response
      const normalizedContent = normalizeContentResponse(content);
      res.json(normalizedContent);
      
    } catch (dbError) {
      console.error('Database error in getContentByDateRange:', dbError.message);
      res.json([]);
    }
  } catch (error) {
    console.error('Error in getContentByDateRange:', error);
    res.status(500).json({
      error: 'Failed to fetch content by date range',
      message: 'System error occurred'
    });
  }
};

// Get content statistics
const getContentStats = async (req, res) => {
  try {
    console.log('getContentStats called');
    
    try {
      const [total, active, byType, recentCount] = await Promise.all([
        SignageContent.count(),
        SignageContent.count({ where: { is_active: true } }),
        SignageContent.findAll({
          attributes: [
            'type',
            [SignageContent.sequelize.fn('COUNT', SignageContent.sequelize.col('id')), 'count']
          ],
          group: ['type']
        }),
        SignageContent.count({
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ]);

      const stats = {
        total,
        active,
        inactive: total - active,
        recentlyAdded: recentCount,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        lastUpdated: new Date()
      };

      console.log('Content statistics:', stats);
      res.json(stats);
    } catch (dbError) {
      console.error('Database error in getContentStats:', dbError.message);
      res.json({
        total: 0,
        active: 0,
        inactive: 0,
        recentlyAdded: 0,
        byType: {},
        lastUpdated: new Date(),
        message: 'Using fallback stats - database connection issue'
      });
    }
  } catch (error) {
    console.error('Error in getContentStats:', error);
    res.status(500).json({
      error: 'Failed to fetch content statistics',
      message: 'System error occurred'
    });
  }
};

// Regenerate QR Code for existing content
const regenerateQRCode = async (req, res) => {
  try {
    console.log(`regenerateQRCode called for ID: ${req.params.id}`);
    
    const { id } = req.params;
    
    try {
      const content = await SignageContent.findByPk(id);
      
      if (!content) {
        return res.status(404).json({
          error: 'Content not found',
          message: 'Cannot regenerate QR code for content that does not exist'
        });
      }

      if (!content.media_url) {
        return res.status(400).json({
          error: 'No media URL',
          message: 'Cannot generate QR code without a media URL'
        });
      }

      const qrCodeUrl = generateQRCodeURL(content.media_url);
      await content.update({ qr_code_url: qrCodeUrl });
      await content.reload();
      
      console.log(`Regenerated QR code for: ${content.title}`);
      
      // FIXED: Normalize response
      const normalizedContent = normalizeContentResponse(content);
      
      res.json({
        message: 'QR code regenerated successfully',
        qrCodeUrl: qrCodeUrl,
        content: normalizedContent
      });
    } catch (dbError) {
      console.error('Database error in regenerateQRCode:', dbError.message);
      res.status(500).json({
        error: 'Database error',
        message: 'Unable to regenerate QR code'
      });
    }
  } catch (error) {
    console.error('Error in regenerateQRCode:', error);
    res.status(500).json({
      error: 'Failed to regenerate QR code',
      message: 'System error occurred'
    });
  }
};

// EXPORT ALL FUNCTIONS INDIVIDUALLY
export {
  getActiveContent,
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  updateDisplayOrder,
  getContentByDateRange,
  getContentStats,
  regenerateQRCode,
  normalizeContentResponse  // Export helper function
};

// DEFAULT EXPORT
export default {
  getActiveContent,
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  updateDisplayOrder,
  getContentByDateRange,
  getContentStats,
  regenerateQRCode,
  normalizeContentResponse
};