import { writable } from 'svelte/store';

const storageKey = 'active-athlete';

function getInitial() {
	if (typeof localStorage === 'undefined') return '';
	try {
		return localStorage.getItem(storageKey) || '';
	} catch (e) {
		console.warn('active athlete read failed', e);
		return '';
	}
}

const store = writable(getInitial());

if (typeof localStorage !== 'undefined') {
	store.subscribe((value) => {
		try {
			if (value) localStorage.setItem(storageKey, value);
			else localStorage.removeItem(storageKey);
		} catch (e) {
			console.warn('active athlete write failed', e);
		}
	});
}

export const activeAthlete = {
	subscribe: store.subscribe,
	set: store.set,
	reset: () => store.set('')
};

