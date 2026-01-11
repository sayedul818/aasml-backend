import { Response, NextFunction } from 'express';
import cloudinary from '../../config/cloudinary';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest } from '../../types';

// Get all media files from Cloudinary
export const getAllMedia = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folder, type } = req.query;
    const maxResults = 500;

    // Build the expression for filtering
    let expression = '';
    
    if (folder) {
      expression = `folder="${folder}"`;
    } else {
      // Get all aasml folders
      expression = 'folder:aasml*';
    }

    if (type) {
      if (type === 'image') {
        expression += ' AND resource_type="image"';
      } else if (type === 'pdf' || type === 'doc') {
        expression += ' AND resource_type="raw"';
      }
    }

    // Search resources in Cloudinary
    const result = await cloudinary.search
      .expression(expression)
      .max_results(maxResults)
      .execute();

    // Format the results
    const media = result.resources.map((item: any) => ({
      _id: item.public_id,
      filename: item.filename || item.public_id.split('/').pop(),
      url: item.secure_url,
      type: getMediaType(item),
      size: item.bytes,
      uploadedAt: item.created_at,
      folder: item.folder,
      resourceType: item.resource_type
    }));

    ApiResponse.success(res, 'Media files retrieved successfully', media);
  } catch (error) {
    next(error);
  }
};

// Get media by folder
export const getMediaByFolder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folder } = req.params;
    const maxResults = 200;

    const result = await cloudinary.search
      .expression(`folder="${folder}"`)
      .max_results(maxResults)
      .execute();

    const media = result.resources.map((item: any) => ({
      _id: item.public_id,
      filename: item.filename || item.public_id.split('/').pop(),
      url: item.secure_url,
      type: getMediaType(item),
      size: item.bytes,
      uploadedAt: item.created_at,
      folder: item.folder,
      resourceType: item.resource_type
    }));

    ApiResponse.success(res, 'Media files retrieved successfully', media);
  } catch (error) {
    next(error);
  }
};

// Delete media from Cloudinary
export const deleteMedia = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { publicId } = req.params;

    // Determine resource type - try image first, then raw
    let result;
    try {
      result = await cloudinary.uploader.destroy(publicId);
    } catch {
      // If it fails, it might be a raw resource
      result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    if (result.result !== 'ok') {
      throw ApiError.badRequest('Failed to delete media file');
    }

    ApiResponse.success(res, 'Media file deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

// Helper function to determine media type
function getMediaType(cloudinaryResource: any): 'image' | 'pdf' | 'doc' {
  const resourceType = cloudinaryResource.resource_type;
  const format = cloudinaryResource.format?.toLowerCase() || '';

  if (resourceType === 'image') {
    return 'image';
  } else if (format === 'pdf') {
    return 'pdf';
  } else if (['doc', 'docx', 'txt', 'xlsx', 'pptx'].includes(format)) {
    return 'doc';
  }

  return 'doc';
}
