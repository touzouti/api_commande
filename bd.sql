CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    dateNaissance DATE NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    motDePasse VARCHAR(255) NOT NULL
);


INSERT INTO utilisateurs (nom, prenom, dateNaissance, adresse, email, motDePasse) VALUES
('Dupont', 'Jean', '1990-01-01', '123 rue de Paris, Paris', 'jean.dupont@email.com', 'password123'),
('Martin', 'Marie', '1985-03-15', '456 avenue de la République, Lyon', 'marie.martin@email.com', 'motdepasse'),
('Lefebvre', 'Luc', '1978-07-22', '789 boulevard des Allies, Marseille', 'luc.lefebvre@email.com', 'password789'),
('Bernard', 'Sophie', '1992-11-30', '101 rue Victor Hugo, Nantes', 'sophie.bernard@email.com', 'sophie1234'),
('Girard', 'Alexandre', '1988-06-04', '202 rue de la Paix, Toulouse', 'alexandre.girard@email.com', 'alexpassword');
