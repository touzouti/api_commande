const axios = require('axios');

const authMiddleware = async (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({
            message: 'Aucun token fourni !'
        });
    }

    try {
        // Appel de l'API de vérification du token
        const response = await axios.get('http://localhost:3000/api/auth/verify-token', {
            headers: { 'x-access-token': token }
        });

        if (response.status === 200) {
            // Si le token est valide, passer à l'étape suivante
            next();
        } else {
            // Si l'API retourne une erreur, renvoyer une réponse d'erreur
            res.status(response.status).send({
                message: 'Échec de l\'authentification du token !'
            });
        }
    } catch (error) {
        // En cas d'erreur dans la requête, retourner une erreur 500
        res.status(500).send({
            message: 'Un problème est survenu lors de la vérification du token !',
            error: error.message
        });
    }
};

module.exports = authMiddleware;
