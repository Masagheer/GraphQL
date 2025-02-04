console.log('utils.js loaded');

export function capitalizeFirstLetter(string) {
    if (!string) return 'N/A';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// for the graphql request
export async function executeGraphQLQuery(query) {
    const token = auth.getToken();
    if (!token) {
        throw new Error('No authentication token available');
    }

    const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Failed to fetch data');
    }

    const result = await response.json();
    if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        throw new Error(result.errors[0].message);
    }

    return result.data;
}
