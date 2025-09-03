
import { image2Vox } from './image2Vox';

async function run() {
    await image2Vox({
        imageFilename: 'src/scripts/input/bitly.png',
        resizeRatio: 0.5,
    });
}

void run().catch(console.error);
