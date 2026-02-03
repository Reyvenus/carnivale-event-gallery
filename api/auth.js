export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;

    // Obtenemos todas las variables de entorno que contienen claves de administrador
    const authorizedPasswords = Object.keys(process.env)
        .filter(key => key.includes('ADMIN_PASSWORD'))
        .map(key => process.env[key]);

    if (authorizedPasswords.includes(password)) {
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false, error: 'Clave incorrecta' });
    }
}
