console.log('utils.js loaded');

export function capitalizeFirstLetter(string) {
    if (!string) return 'N/A';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
