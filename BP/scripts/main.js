import { world, MinecraftBlockTypes } from "@minecraft/server"

world.afterEvents.itemUse.subscribe((event) => {
    const item = event.itemStack;
    const player = event.source;
    if (item != undefined && item.typeId != undefined
        && item.typeId == "explosives:paroxys_cannon") {
        const block = player.getBlockFromViewDirection({ maxDistance: 100 });
        try {
            block.dimension.createExplosion(block.location, 40,
                { allowUnderwater: true, causesFire: true }
            );
        } catch (e) {

        }
    }
});

world.afterEvents.itemStartUseOn.subscribe((event) => {
    const item = event.itemStack;
    const block = event.block;
    if (item != undefined) {
        if (item.typeId == "minecraft:flint_and_steel") {
            if (block.typeId == "explosives:bomb") {
                block.setType(MinecraftBlockTypes.air);
                const blockLocation = block.location;
                const bomb = block.dimension.spawnEntity("explosives:bomb", {
                    x: blockLocation.x + 0.5,
                    y: blockLocation.y,
                    z: blockLocation.z + 0.5
                });

                bomb.addEffect("speed", 200, { aplifier: 10, showParticles: true });
            } else if (block.typeId == "explosives:mininuke") {
                block.setType(MinecraftBlockTypes.air);
                const blockLocation = block.location;
                const bomb = block.dimension.spawnEntity("explosives:mininuke", {
                    x: blockLocation.x + 0.5,
                    y: blockLocation.y,
                    z: blockLocation.z + 0.5
                });

                bomb.addEffect("poison", 200, { aplifier: 10, showParticles: true });
            }
        }
    }
});

var impactedExplosives = [];
var impactedTypes = [];

var newExplosionLocations = [];

world.beforeEvents.explosion.subscribe((event) => {
    if (event.source != undefined
        && event.source.typeId != "explosives:mininuke_additional_explosion") {
        event.getImpactedBlocks().forEach((blockPos) => {
            try {
                const block = event.dimension.getBlock(blockPos);
                if (block != undefined
                    && block.typeId.includes("explosives")) {
                    impactedExplosives.push(blockPos);
                    impactedTypes.push(block.typeId);
                }
            } catch (e) {
                return;
            }
        });

        if (event.source != undefined && event.source.typeId == "explosives:mininuke") {
            const dist = 20;
            const sourceLoc = event.source.location;
            newExplosionLocations = [
                { x: sourceLoc.x - dist, y: sourceLoc.y - dist, z: sourceLoc.z - dist },
                { x: sourceLoc.x, y: sourceLoc.y - dist, z: sourceLoc.z - dist },
                { x: sourceLoc.x + dist, y: sourceLoc.y - dist, z: sourceLoc.z - dist },
                { x: sourceLoc.x - dist, y: sourceLoc.y - dist, z: sourceLoc.z },
                { x: sourceLoc.x, y: sourceLoc.y - dist, z: sourceLoc.z },
                { x: sourceLoc.x + dist, y: sourceLoc.y - dist, z: sourceLoc.z },
                { x: sourceLoc.x - dist, y: sourceLoc.y - dist, z: sourceLoc.z + dist },
                { x: sourceLoc.x, y: sourceLoc.y - dist, z: sourceLoc.z + dist },
                { x: sourceLoc.x + dist, y: sourceLoc.y - dist, z: sourceLoc.z + dist },

                { x: sourceLoc.x - dist, y: sourceLoc.y, z: sourceLoc.z - dist },
                { x: sourceLoc.x, y: sourceLoc.y, z: sourceLoc.z - dist },
                { x: sourceLoc.x + dist, y: sourceLoc.y, z: sourceLoc.z - dist },
                { x: sourceLoc.x - dist, y: sourceLoc.y, z: sourceLoc.z },
                { x: sourceLoc.x + dist, y: sourceLoc.y, z: sourceLoc.z },
                { x: sourceLoc.x - dist, y: sourceLoc.y, z: sourceLoc.z + dist },
                { x: sourceLoc.x, y: sourceLoc.y, z: sourceLoc.z + dist },
                { x: sourceLoc.x + dist, y: sourceLoc.y, z: sourceLoc.z + dist },

                { x: sourceLoc.x - dist, y: sourceLoc.y + dist, z: sourceLoc.z - dist },
                { x: sourceLoc.x, y: sourceLoc.y + dist, z: sourceLoc.z - dist },
                { x: sourceLoc.x + dist, y: sourceLoc.y + dist, z: sourceLoc.z - dist },
                { x: sourceLoc.x - dist, y: sourceLoc.y + dist, z: sourceLoc.z },
                { x: sourceLoc.x, y: sourceLoc.y + dist, z: sourceLoc.z },
                { x: sourceLoc.x + dist, y: sourceLoc.y + dist, z: sourceLoc.z },
                { x: sourceLoc.x - dist, y: sourceLoc.y + dist, z: sourceLoc.z + dist },
                { x: sourceLoc.x, y: sourceLoc.y + dist, z: sourceLoc.z + dist },
                { x: sourceLoc.x + dist, y: sourceLoc.y + dist, z: sourceLoc.z + dist },
            ]
        }
    }
});

world.afterEvents.explosion.subscribe((event) => {
    for (let i = 0; i < impactedExplosives.length; i++) {
        const blockPos = impactedExplosives[i];
        const blockType = impactedTypes[i];
        const block = event.dimension.getBlock(blockPos);
        block.setType(MinecraftBlockTypes.air);
        const bomb = event.dimension.spawnEntity(blockType, {
            x: blockPos.x + 0.5,
            y: blockPos.y,
            z: blockPos.z + 0.5
        });
        bomb.addEffect("speed", 200, { aplifier: 10, showParticles: true });
    }

    impactedExplosives = [];
    impactedTypes = [];


    if (newExplosionLocations.length > 0) {
        newExplosionLocations.forEach((location) => {
            try {
                event.dimension.createExplosion(location, 40, {
                    allowUnderwater: true, causesFire: true
                });
                //event.dimension.spawnEntity("explosives:mininuke_additional_explosion", location);
            } catch (e) {
                return;
            }
        });
    }
    newExplosionLocations = [];
});


function log(message) {
    world.getAllPlayers().forEach((player) => {
        player.sendMessage(message);
    });
}