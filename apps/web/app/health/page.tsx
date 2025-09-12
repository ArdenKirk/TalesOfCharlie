export default async function Health() {
    const res = await fetch("http://localhost/api/health", { cache: "no-store" });
    const json = await res.json();
    return <pre>{JSON.stringify(json, null, 2)}</pre>;
}
