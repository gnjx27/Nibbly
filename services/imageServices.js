// Expo Imports
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compress Image to 1080px, 70%
 * @param {*} uri 
 * @returns uri
 */
export const compressImage = async (uri) => {
    const result = await ImageManipulator.manipulateAsync(
        uri,
        [
            { resize: { width: 1080 } } // resize to 1080px wide, keep aspect ratio
        ],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // compress to 70%
    );
    return result.uri;
};