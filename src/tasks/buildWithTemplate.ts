import { Vec3 } from "@dust/world/internal";
import * as fs from "fs";
import { build } from "../actions/build";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext, ToleranceType } from "../types";
import { movePlayer } from "./movePlayer";

/** 
 * Builds with a template
 * @param params Parameters for building with template
 * @param context The bot context
 */

export type BuildWithTemplateParams = {
    templateFile: string;
    offset: Vec3;
}

export async function buildWithTemplate(
    params: BuildWithTemplateParams,
    context: BotContext
): Promise<void> {
    const { templateFile, offset } = params;

    // Read the template file
    let templateContent: string;
    try {
        templateContent = fs.readFileSync(templateFile, 'utf8');
    } catch (error) {
        console.error(`Failed to read template file: ${templateFile}`, error);
        return;
    }

    // Parse the template
    const lines = templateContent.trim().split('\n');
    if (lines.length === 0) {
        console.error('Template file is empty');
        return;
    }

    // Parse the first line to get dimensions
    const firstLine = lines[0] || '';
    const dimensionsMatch = firstLine.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!dimensionsMatch || dimensionsMatch.length < 4) {
        console.error('Invalid dimensions format in template file');
        return;
    }

    // Use non-null assertion since we've already checked dimensionsMatch exists and has length >= 4
    const width = parseInt(dimensionsMatch[1]!, 10);
    const height = parseInt(dimensionsMatch[2]!, 10);
    const depth = parseInt(dimensionsMatch[3]!, 10);
    console.log(`Building dimensions: ${width}x${height}x${depth}`);

    // Parse the voxels
    const voxels: { x: number; y: number; z: number; material: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim() === '') continue;

        const parts = line.split(',').map(part => part.trim()) as [string, string, string, string];
        if (parts.length !== 4) {
            console.warn(`Skipping invalid voxel line: ${line}`);
            continue;
        }

        const x = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10);
        const z = parseInt(parts[2], 10);
        const material = parseInt(parts[3], 10);

        if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(material)) {
            console.warn(`Skipping voxel with invalid numbers: ${line}`);
            continue;
        }

        voxels.push({ x, y, z, material });
    }

    console.log(`Parsed ${voxels.length} voxels from template`);

    // Build each voxel in the order they appear in the template
    for (const voxel of voxels) {
        // Get player position
        const playerPos = await context.player.getPos();

        // Calculate absolute position with offset
        const buildPos: Vec3 = [
            offset[0] + voxel.x,
            offset[1] + voxel.y,
            offset[2] + voxel.z
        ];

        // Find slots with this material
        const slotsWithMaterial = getSlotsWithObject(
            context.player.entityId,
            voxel.material,
            context
        );

        if (slotsWithMaterial.length === 0) {
            console.warn(`No inventory slots found with material ${voxel.material}`);
            continue;
        }

        // Use the first available slot
        const slotToUse = slotsWithMaterial[0]!.slot;

        // Move player near the building position if needed
        const distanceToPos = Math.sqrt(
            Math.pow(playerPos[0] - buildPos[0], 2) +
            Math.pow(playerPos[1] - buildPos[1], 2) +
            Math.pow(playerPos[2] - buildPos[2], 2)
        );

        // If player is too far, move closer
        if (distanceToPos > 5) {
            const moveSuccess = await movePlayer(
                buildPos,
                context,
                {
                    toleranceType: ToleranceType.Cube,
                    tolerance: 5,
                    avoidBlocks: ["Lava", "Water"],
                }
            );

            if (!moveSuccess) {
                console.warn(`Failed to move to position (${buildPos[0]}, ${buildPos[1]}, ${buildPos[2]})`);
                continue;
            }
        }

        // Build the voxel
        try {
            await build(buildPos, slotToUse, context);
            console.log(`Built voxel at (${buildPos[0]}, ${buildPos[1]}, ${buildPos[2]}) with material ${voxel.material}`);
        } catch (error) {
            console.error(`Failed to build at (${buildPos[0]}, ${buildPos[1]}, ${buildPos[2]}):`, error);
        }
    }

    console.log('Building with template completed');
}