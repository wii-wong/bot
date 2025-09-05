import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

export type image2VoxParam = {
    imageFilename: string
    resizeRatio: number
}

// Function to calculate the Euclidean distance between two RGB colors
function colorDistance(color1: number[], color2: number[]): number {
    const r1 = color1[0] || 0;
    const g1 = color1[1] || 0;
    const b1 = color1[2] || 0;

    const r2 = color2[0] || 0;
    const g2 = color2[1] || 0;
    const b2 = color2[2] || 0;

    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

// Function to find the closest color in the colormap
function findClosestColor(pixelColor: number[], colormap: Record<string, number[]>): string {
    let minDistance = Infinity;
    let closestBlockType = '';

    for (const [blockType, rgbColor] of Object.entries(colormap)) {
        const distance = colorDistance(pixelColor, rgbColor);
        if (distance < minDistance) {
            minDistance = distance;
            closestBlockType = blockType;
        }
    }

    return closestBlockType;
}

export async function image2Vox(param: image2VoxParam) {
    const { imageFilename, resizeRatio } = param;

    try {
        // Load the colormap
        const colormapPath = path.resolve('src/scripts/colormap.json');
        const colormap = await fs.readJSON(colormapPath);

        // Load the image
        const imagePath = path.resolve(imageFilename);

        // Get image metadata
        const metadata = await sharp(imagePath).metadata();
        const originalWidth = metadata.width || 0;
        const originalHeight = metadata.height || 0;
        const newWidth = Math.round(originalWidth * resizeRatio);
        const newHeight = Math.round(originalHeight * resizeRatio);

        // Resize the image
        const resizedImage = sharp(imagePath).resize(newWidth, newHeight);

        // Save the resized image to output folder
        const resizedImageFilename = path.basename(imageFilename);
        const resizedImagePath = path.resolve('src/scripts/output', resizedImageFilename);
        await resizedImage.toFile(resizedImagePath);
        console.log(`Resized image saved to: ${resizedImagePath}`);

        // Get raw pixel data for voxel processing
        const { data, info } = await resizedImage
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { channels } = info;

        // Create voxel data structure
        const voxels: { x: number; y: number; z: number; material: string }[] = [];

        // Process each pixel in the image
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                const idx = (y * newWidth + x) * channels;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = channels === 4 ? data[idx + 3] : 255;

                // Skip transparent pixels
                if ((a ?? 255) < 128) continue;

                // Convert to RGB array format for comparison
                const rgb = [r ?? 0, g ?? 0, b ?? 0];

                // Find the closest color in the colormap
                const blockType = findClosestColor(rgb, colormap);

                // Add voxel to the list (using z=0 for 2D image)
                voxels.push({
                    x,
                    y: 0, // All voxels at the same y level for a 2D image
                    z: y, // Invert y-axis to match the coordinate system
                    material: blockType
                });
            }
        }

        // Generate .dust file content
        let dustContent = `${newWidth},1,${newHeight}\n`; // width,height,depth

        // Sort voxels according to the arrangement rule: x-axis first, then z-axis, finally y-axis
        voxels.sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            if (a.z !== b.z) return a.z - b.z;
            return a.x - b.x;
        });

        // Add each voxel to the content
        for (const voxel of voxels) {
            dustContent += `${voxel.x},${voxel.y},${voxel.z},${voxel.material}\n`;
        }

        // Create output filename based on input filename
        const outputFilename = path.basename(imageFilename, path.extname(imageFilename)) + '.dust';
        const outputPath = path.resolve('src/scripts/output', outputFilename);

        // Ensure output directory exists
        await fs.ensureDir(path.dirname(outputPath));

        // Write the .dust file
        await fs.writeFile(outputPath, dustContent);

        // Generate blocktype count JSON
        const blocktypeCounts: Record<string, number> = {};

        // Count occurrences of each blocktype
        for (const voxel of voxels) {
            const blockType = voxel.material;
            blocktypeCounts[blockType] = (blocktypeCounts[blockType] || 0) + 1;
        }

        // Create output filename for the JSON file
        const jsonOutputFilename = path.basename(imageFilename, path.extname(imageFilename)) + '_blockcount.json';
        const jsonOutputPath = path.resolve('src/scripts/output', jsonOutputFilename);

        // Write the JSON file
        await fs.writeFile(jsonOutputPath, JSON.stringify(blocktypeCounts, null, 2));

        console.log(`Successfully converted ${imageFilename} to ${outputFilename}`);
        console.log(`Output saved to: ${outputPath}`);
        console.log(`Block count JSON saved to: ${jsonOutputPath}`);

        return outputPath;
    } catch (error) {
        console.error('Error in image2Vox:', error);
        throw error;
    }
}