
export default async function(){

    const relaysDocument = await fetch("https://raw.githubusercontent.com/wiki/amark/gun/volunteer.dht.md").then(response => response.text());

    //Find urls and normalize them. Note that only https links are used.
    const volunteerRelays = [...relaysDocument.matchAll(/\bhttps:\/\/[^\s]*\b/gui)]
        .map(url => (new URL(url)).href)

    return volunteerRelays;

}