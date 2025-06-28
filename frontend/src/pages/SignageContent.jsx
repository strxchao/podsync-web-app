import { Table, Button, Modal, Label, TextInput, Textarea, Alert, Spinner, Badge } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { apiMethods } from '../api.js';

export function SignageContent() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [selectedQRContent, setSelectedQRContent] = useState(null);
  const [toggleLoading, setToggleLoading] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: ''
  });

  useEffect(() => {
    fetchContents();
  }, []);

  // FIXED: Enhanced fetchContents dengan better debugging
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('FETCH CONTENTS started');
      
      // FIXED: Always fetch ALL content (both active and inactive)
      const response = await apiMethods.getSignageContent(false); // false = get all content
      
      console.log('FETCH RESPONSE received:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: Array.isArray(response.data) ? response.data.length : 'N/A'
      });
      
      let contentsData = [];
      if (Array.isArray(response.data)) {
        contentsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        contentsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.rows)) {
        contentsData = response.data.rows;
      } else {
        console.warn('Unexpected response structure:', response.data);
        contentsData = [];
      }
      
      // DEBUG: Log field mapping for first few items
      console.log('CONTENT ITEMS analysis:');
      contentsData.slice(0, 3).forEach((item, index) => {
        console.log(`Item ${index}:`, {
          id: item.id,
          title: item.title,
          isActive: item.isActive,
          is_active: item.is_active,
          hasMediaUrl: !!(item.mediaUrl || item.media_url),
          hasQRCode: !!(item.qrCodeUrl || item.qr_code_url)
        });
      });
      
      console.log(`FETCH COMPLETED: Loaded ${contentsData.length} contents`);
      setContents(contentsData);
      
    } catch (error) {
      console.error('FETCH ERROR:', error);
      setError('Failed to load signage contents. Please check if the server is running.');
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Enhanced handleSubmit untuk create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('FORM SUBMIT started:', {
        editing: !!editingContent,
        formData: formData
      });
      
      const contentData = {
        title: formData.title,
        description: formData.description,
        type: 'announcement', // Default type since type field was removed
        mediaUrl: formData.mediaUrl || null,
        createdBy: 'admin',
        isActive: true, // New content is active by default
        displayOrder: 0
      };

      let response;
      if (editingContent) {
        console.log(`UPDATING content ${editingContent.id}`);
        response = await apiMethods.updateContent(editingContent.id, contentData);
      } else {
        console.log('CREATING new content');
        response = await apiMethods.createContent(contentData);
      }
      
      console.log('SUBMIT RESPONSE:', {
        status: response.status,
        id: response.data?.id,
        title: response.data?.title
      });
      
      // Close modal and reset form
      setShowModal(false);
      setEditingContent(null);
      setFormData({ title: '', description: '', mediaUrl: '' });
      
      // CRITICAL: Always refresh data after create/update
      console.log('REFRESHING data after submit...');
      await fetchContents();
      
      // Clear any errors
      setError(null);
      console.log('FORM SUBMIT completed successfully');
      
    } catch (error) {
      console.error('FORM SUBMIT ERROR:', error);
      setError(`Failed to ${editingContent ? 'update' : 'create'} signage content: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title || '',
      description: content.description || '',
      mediaUrl: content.mediaUrl || content.media_url || ''
    });
    setShowModal(true);
  };

  // CRITICAL FIX: Enhanced handleToggleActive function
  const handleToggleActive = async (content) => {
    const originalContentId = content.id;
    
    try {
      setToggleLoading(prev => ({ ...prev, [originalContentId]: true }));
      
      // STEP 1: Get current status dengan debugging
      const currentStatus = content.isActive !== undefined ? content.isActive : 
                           (content.is_active !== undefined ? content.is_active : true);
      const newActiveStatus = !currentStatus;
      
      console.log(`TOGGLE DEBUG for "${content.title}":`, {
        contentId: originalContentId,
        currentIsActive: content.isActive,
        currentIs_active: content.is_active,
        resolvedCurrentStatus: currentStatus,
        newActiveStatus: newActiveStatus
      });
      
      // STEP 2: OPTIMISTIC UPDATE - Update UI immediately
      setContents(prevContents => {
        const updated = prevContents.map(item => 
          item.id === originalContentId 
            ? { 
                ...item, 
                isActive: newActiveStatus, 
                is_active: newActiveStatus 
              }
            : item
        );
        
        console.log(`OPTIMISTIC UPDATE applied for ${originalContentId}`);
        return updated;
      });
      
      // STEP 3: PREPARE DATA - Send complete data to backend
      const updatePayload = {
        title: content.title,
        description: content.description || content.content || '',
        type: content.type || 'announcement',
        mediaUrl: content.mediaUrl || content.media_url || '',
        displayOrder: content.displayOrder || content.display_order || 0,
        createdBy: content.createdBy || content.created_by || 'admin',
        isActive: newActiveStatus  // CRITICAL: Send new status
      };
      
      console.log('SENDING UPDATE to backend:', {
        id: originalContentId,
        isActive: updatePayload.isActive,
        endpoint: `/api/content/${originalContentId}`
      });
      
      // STEP 4: API CALL - Update backend
      const response = await apiMethods.updateContent(originalContentId, updatePayload);
      
      console.log('BACKEND RESPONSE received:', {
        status: response.status,
        id: response.data?.id,
        title: response.data?.title,
        isActive: response.data?.isActive,
        is_active: response.data?.is_active
      });
      
      // STEP 5: VERIFY RESPONSE - Update state with backend response
      if (response.data) {
        const updatedContent = response.data;
        
        setContents(prevContents => {
          const final = prevContents.map(item => 
            item.id === originalContentId 
              ? { 
                  ...item,
                  ...updatedContent,
                  // CRITICAL: Ensure both field versions exist
                  isActive: updatedContent.isActive !== undefined ? 
                           updatedContent.isActive : newActiveStatus,
                  is_active: updatedContent.is_active !== undefined ? 
                            updatedContent.is_active : newActiveStatus
                }
              : item
          );
          
          console.log(`FINAL STATE updated for ${originalContentId}`);
          return final;
        });
      }
      
      console.log(`SUCCESS: "${content.title}" toggled to ${newActiveStatus ? 'ACTIVE' : 'INACTIVE'}`);
      
      // Clear any previous errors
      setError(null);
      
    } catch (error) {
      console.error('TOGGLE ERROR:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // STEP 6: ROLLBACK - Revert optimistic update on error
      const currentStatus = content.isActive !== undefined ? content.isActive : 
                           (content.is_active !== undefined ? content.is_active : true);
      
      setContents(prevContents => {
        const rolledBack = prevContents.map(item => 
          item.id === originalContentId 
            ? { 
                ...item, 
                isActive: currentStatus, 
                is_active: currentStatus 
              }
            : item
        );
        
        console.log(`🔙 ROLLBACK applied for ${originalContentId}`);
        return rolledBack;
      });
      
      // Show detailed error message
      setError(`Failed to ${currentStatus ? 'deactivate' : 'activate'} content "${content.title}": ${error.response?.data?.message || error.message}`);
      
    } finally {
      setToggleLoading(prev => ({ ...prev, [originalContentId]: false }));
      console.log(`🏁 TOGGLE COMPLETED for ${originalContentId}`);
    }
  };

  const showQRCode = (content) => {
    setSelectedQRContent(content);
    setShowQRModal(true);
  };

  const regenerateQRCode = async (contentId) => {
    try {
      await apiMethods.regenerateQRCode(contentId);
      await fetchContents(); // Refresh to get updated QR code
      setError(null);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      setError('Failed to regenerate QR code');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContent(null);
    setFormData({ 
      title: '', 
      description: '', 
      mediaUrl: ''
    });
  };

  // ENHANCED: Get media URL dari content dengan fallback
  const getMediaUrl = (content) => {
    return content.mediaUrl || content.media_url || null;
  };

  // ENHANCED: Get QR code URL dari content dengan fallback
  const getQRCodeUrl = (content) => {
    return content.qrCodeUrl || content.qr_code_url || null;
  };

  // ENHANCED: Get active status dengan fallback dan debugging
  const getActiveStatus = (content) => {
    if (!content) {
      console.warn('getActiveStatus called with null/undefined content');
      return true;
    }
    
    // Check multiple possible field names with priority
    let activeStatus;
    
    if (content.isActive !== undefined) {
      activeStatus = Boolean(content.isActive);
    } else if (content.is_active !== undefined) {
      activeStatus = Boolean(content.is_active);
    } else {
      activeStatus = true; // Default fallback
    }
    
    console.log(`Active status for "${content.title}":`, {
      isActive: content.isActive,
      is_active: content.is_active,
      resolved: activeStatus
    });
    
    return activeStatus;
  };

  // DEBUGGING: Add debug function untuk troubleshooting
  const debugContentState = () => {
    console.log('🐛 CURRENT CONTENT STATE DEBUG:');
    console.log(`Total contents: ${contents.length}`);
    
    contents.forEach((content, index) => {
      console.log(`Content ${index}:`, {
        id: content.id,
        title: content.title,
        isActive: content.isActive,
        is_active: content.is_active,
        resolved: getActiveStatus(content)
      });
    });
    
    console.log('Toggle loading states:', toggleLoading);
  };

  // Make debug function available globally for console access
  window.debugContentState = debugContentState;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-2">Loading signage content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Signage Content Management</h1>
        </div>
        <Button className="focus:ring-green-300 enabled:hover:bg-green-700 dark:bg-green-600 dark:focus:ring-green-800 dark:enabled:hover:bg-green-700 rounded-lg bg-green-500" onClick={() => setShowModal(true)}>
          Add New Content
        </Button>
      </div>

      {error && (
        <Alert color="failure" className="mb-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="overflow-x-auto">
        <Table striped hoverable>
          <Table.Head>
            <Table.HeadCell>Title</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Media URL</Table.HeadCell>
            <Table.HeadCell>QR Code</Table.HeadCell>
            <Table.HeadCell>Created Date</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {contents && contents.length > 0 ? (
              contents.map((content, index) => {
                const mediaUrl = getMediaUrl(content);
                const qrCodeUrl = getQRCodeUrl(content);
                const isActive = getActiveStatus(content);
                
                return (
                  <Table.Row key={content.id || index} className={`${isActive ? 'bg-white' : 'bg-gray-50'} dark:border-gray-700 dark:bg-gray-800`}>
                    <Table.Cell className={`whitespace-nowrap font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'} dark:text-white`}>
                      {content.title || 'N/A'}
                      {!isActive && <span className="ml-2 text-xs text-gray-400">(Inactive)</span>}
                    </Table.Cell>
                    <Table.Cell className="max-w-xs">
                      <div className="truncate" title={content.description || content.content}>
                        {content.description || content.content || 'No description'}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {mediaUrl ? (
                        <div className="flex flex-col space-y-2">
                          <a 
                            href={mediaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline text-sm truncate max-w-32"
                          >
                            View Media
                          </a>
                          <div className="text-xs text-gray-500 truncate max-w-32" title={mediaUrl}>
                            {mediaUrl}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No media</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {qrCodeUrl ? (
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="xs"
                            className='focus:ring-green-300 enabled:hover:bg-green-700 dark:bg-green-600 dark:focus:ring-green-800 dark:enabled:hover:bg-green-700 rounded-lg bg-green-500'
                            onClick={() => showQRCode(content)}
                          >
                            View QR
                          </Button>
                          <Button
                            size="xs"
                            color="green"
                            onClick={() => regenerateQRCode(content.id)}
                          >
                            Regenerate
                          </Button>
                        </div>
                      ) : (
                        mediaUrl ? (
                          <Button
                            size="xs"
                            color="success"
                            onClick={() => regenerateQRCode(content.id)}
                          >
                            Generate QR
                          </Button>
                        ) : (
                          <span className="text-gray-400">No QR Code</span>
                        )
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {content.createdAt || content.created_at ? 
                            new Date(content.createdAt || content.created_at).toLocaleDateString('id-ID') : 
                            'N/A'
                          }
                        </div>
                        <div className="text-gray-500">
                          {content.createdAt || content.created_at ? 
                            new Date(content.createdAt || content.created_at).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : ''
                          }
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={isActive ? "success" : "gray"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        <Button 
                          color="warning" 
                          size="sm"
                          onClick={() => handleEdit(content)}
                        >
                          Edit
                        </Button>
                        {/* FIXED: Delete button diganti dengan Active/Inactive Toggle */}
                        <div className="flex items-center space-x-2">
                          <Button 
                            color={isActive ? "failure" : "success"}
                            size="sm"
                            onClick={() => handleToggleActive(content)}
                            disabled={toggleLoading[content.id]}
                          >
                            {toggleLoading[content.id] ? (
                              <>
                                <Spinner size="sm" className="mr-1" />
                                Processing...
                              </>
                            ) : isActive ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        </div>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center text-gray-500 py-8">
                  {error ? 'Error loading content' : 'No signage content found. Click "Add New Content" to get started.'}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Add/Edit Content Modal */}
      <Modal show={showModal} onClose={closeModal} size="lg">
        <Modal.Header>
          {editingContent ? 'Edit Signage Content' : 'Add New Signage Content'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <TextInput
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter content title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter content description"
              />
            </div>
            
            <div>
              <Label htmlFor="mediaUrl">Media URL</Label>
              <TextInput
                id="mediaUrl"
                type="url"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                placeholder="Enter media URL (QR code will be auto-generated)"
              />
              {formData.mediaUrl && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-800">
                    <strong>QR Code Preview:</strong> QR code will be automatically generated and saved to database when you save this content.
                  </div>
                  <div className="text-xs text-green-600 mt-1 break-all">
                    URL: {formData.mediaUrl}
                  </div>
                  <div className="mt-2">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(formData.mediaUrl)}`}
                      alt="QR Preview"
                      className="border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Info:</strong> New content will be set to "Active" by default. You can change the status using the toggle in the content list.
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button color="gray" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" className="enabled:hover:bg-green-700 dark:bg-green-600 dark:focus:ring-green-800 dark:enabled:hover:bg-green-700 rounded-lg bg-green-500">
                {editingContent ? 'Update Content' : 'Save Content'}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* QR Code Display Modal */}
      <Modal show={showQRModal} onClose={() => setShowQRModal(false)} size="md">
        <Modal.Header>
          QR Code for Media URL
        </Modal.Header>
        <Modal.Body>
          {selectedQRContent && (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">{selectedQRContent.title}</h3>
              
              {getQRCodeUrl(selectedQRContent) ? (
                <>
                  <div className="flex justify-center">
                    <img 
                      src={getQRCodeUrl(selectedQRContent)} 
                      alt="QR Code"
                      className="border rounded-lg shadow-lg max-w-full h-auto"
                      onError={(e) => {
                        // Fallback jika QR code URL tidak bisa dimuat
                        const mediaUrl = getMediaUrl(selectedQRContent);
                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mediaUrl || 'No URL')}`;
                      }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded">
                    <strong>Media URL:</strong> {getMediaUrl(selectedQRContent)}
                  </div>
                  
                  <div className="text-sm text-gray-600 break-all bg-blue-50 p-3 rounded">
                    <strong>QR Code URL (for API):</strong> {getQRCodeUrl(selectedQRContent)}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created: {selectedQRContent.createdAt || selectedQRContent.created_at ? 
                      new Date(selectedQRContent.createdAt || selectedQRContent.created_at).toLocaleString('id-ID') : 'N/A'}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      className="enabled:hover:bg-green-700 dark:bg-green-600 dark:enabled:hover:bg-green-700 rounded-lg bg-green-500"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getQRCodeUrl(selectedQRContent);
                        link.download = `qr-${selectedQRContent.title.replace(/\s+/g, '-')}.png`;
                        link.click();
                      }}
                    >
                      Download QR Code
                    </Button>
                    <Button
                      className="enabled:hover:bg-green-700 dark:bg-green-600 dark:focus:ring-green-800 dark:enabled:hover:bg-green-700 rounded-lg bg-green-500"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(getQRCodeUrl(selectedQRContent));
                        alert('QR Code URL copied to clipboard!');
                      }}
                    >
                      Copy QR URL
                    </Button>
                    <Button
                      color="green"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(getMediaUrl(selectedQRContent));
                        alert('Media URL copied to clipboard!');
                      }}
                    >
                      Copy Media URL
                    </Button>
                    <Button
                      color="red"
                      size="sm"
                      onClick={() => setShowQRModal(false)}
                    >
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    No QR code available for this content
                  </div>
                  {getMediaUrl(selectedQRContent) ? (
                    <Button
                      color="success"
                      onClick={() => {
                        regenerateQRCode(selectedQRContent.id);
                        setShowQRModal(false);
                      }}
                    >
                      Generate QR Code
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Add a media URL to generate QR code
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}