export function getGeneratedName(seed: string) {
	// Two lists of words
	const adjectives = [
		'Quantum',
		'Neural',
		'Celestial',
		'Shadow',
		'Phantom',
		'Cyber',
		'Void',
		'Eldritch',
		'Nebula',
		'Solar',
		'Luminous',
		'Frost',
		'Plasma',
		'Rune',
		'Nano',
		'Stellar',
		'Mystic',
		'Holographic',
		'Dimensional',
		'Iron',
		'Crystal',
		'Chaos',
		'Ethereal',
		'Glowing',
		'Mech',
		'Spectral',
		'Infinite',
		'Dark',
		'Radiant',
		'Cosmic',
		'Digital',
	] as const;
	const names = [
		'Blade',
		'Core',
		'Matrix',
		'Orb',
		'Scepter',
		'Pulse',
		'Nexus',
		'Gauntlet',
		'Drone',
		'Sphere',
		'Circuit',
		'Titan',
		'Wraith',
		'Beacon',
		'Rift',
		'Golem',
		'Haven',
		'Star',
		'Portal',
		'Phantom',
		'Reactor',
		'Sentinel',
		'Storm',
		'Vault',
		'Echo',
		'Monolith',
		'Hologram',
		'Relic',
		'Catalyst',
		'Dragon',
		'Array',
	] as const;

	const getSeedBasedRandom = (s: string, index: number): number => {
		let hash = 0;
		for (let i = 0; i < s.length; i++) {
			hash = (hash << 5) - hash + s.charCodeAt(i);
			hash |= 0;
		}

		return Math.abs(hash) % (index + 1);
	};

	const getRandomElement = (
		list: typeof adjectives | typeof names,
		seed: string,
	): string => {
		const randomValue = getSeedBasedRandom(seed, list.length);
		return list[randomValue];
	};

	const word1: string = getRandomElement(adjectives, seed);
	const word2: string = getRandomElement(names, seed);

	const generatedName: string = `${word1} ${word2}`;

	return generatedName;
}
