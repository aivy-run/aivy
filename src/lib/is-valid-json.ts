export const isValidJSON = (t: string) => {
    try {
        JSON.parse(t)
        return true
    } catch (error) {
        return false
    }
}
