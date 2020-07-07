import { getToken } from './MSAuth';

const graph = require('@microsoft/microsoft-graph-client');

async function getAuthenticatedClient() {
    try {
        const accessToken = await getToken();
        const client = graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken.accessToken);
            },
        });

        return client;
    } catch (error) {
        console.log(`GetAClientErr: ${error}`);
    }
}

async function getGroupsFromApi(filterOptionWithoutMembers = null) {
    const client = await getAuthenticatedClient();
    if (filterOptionWithoutMembers) {
        // eslint-disable-next-line prefer-const
        let groups = await client
            .api('/groups?$top=100')
            .select(filterOptionWithoutMembers)
            .get();

        while (groups['@odata.nextLink']) {
            const groupsNext = await client
                .api(groups['@odata.nextLink'])
                .get();
            groupsNext.value.map((item) => groups.value.push(item));
            groups['@odata.nextLink'] = groupsNext['@odata.nextLink'];
            console.log(groups);
        }
        return groups;
    } else {
        // eslint-disable-next-line prefer-const
        let groups = await client.api('/groups?$top=100').get();

        while (groups['@odata.nextLink']) {
            const groupsNext = await client
                .api(groups['@odata.nextLink'])
                .get();
            groupsNext.value.map((item) => groups.value.push(item));
            groups['@odata.nextLink'] = groupsNext['@odata.nextLink'];
            console.log(groups);
        }
        return groups;
    }
}

export async function getUserDetails() {
    try {
        const client = await getAuthenticatedClient();

        const user = await client.api('/me').get();

        return user;
    } catch (error) {
        console.log(`GetUDetails: ${error}`);
    }
}

export async function getGroupDetails(groupName) {
    try {
        const client = await getAuthenticatedClient();

        const groupDetails = await client
            .api(`/groups?$filter=mail eq '${groupName}'`)
            .get();

        return groupDetails;
    } catch (error) {
        throw error;
    }
}

export async function getGroupOwners(groupId) {
    try {
        const client = await getAuthenticatedClient();

        const owners = await client.api(`groups/${groupId}/owners`).get();

        return owners;
    } catch (error) {
        throw error;
    }
}

export async function getGroupMembers(groupId) {
    try {
        const client = await getAuthenticatedClient();

        const members = await client.api(`groups/${groupId}/members`).get();

        return members;
    } catch (error) {
        throw error;
    }
}

export async function getGroups(filterOptions) {
    try {
        const filterOptionWithoutMembers = filterOptions
            .filter((item) => item !== 'members')
            .toString();
        let groups = await getGroupsFromApi(filterOptionWithoutMembers);

        if (filterOptions.includes('members')) {
            // Promise.all to resolve all promises from array
            groups = await Promise.all(
                groups.value.map(async (group) => {
                    const members = await getGroupMembers(group.id);
                    const owners = await getGroupOwners(group.id);
                    return {
                        ...group,
                        members: members.value.map((member) => member.mail),
                        owners: owners.value.map((owner) => owner.mail),
                    };
                })
            );
            return groups;
        }

        return groups.value;
    } catch (error) {
        throw error;
    }
}

export async function getAllGroups() {
    try {
        let groups = await getGroupsFromApi();
        groups = await Promise.all(
            groups.value.map(async (group) => {
                const members = await getGroupMembers(group.id);
                const owners = await getGroupOwners(group.id);
                return {
                    ...group,
                    members: members.value.map((member) => member.mail),
                    owners: owners.value.map((owner) => owner.mail),
                };
            })
        );
        return groups;
    } catch (error) {
        throw error;
    }
}
