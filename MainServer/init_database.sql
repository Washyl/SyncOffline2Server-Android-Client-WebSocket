CREATE TABLE net_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    action VARCHAR(20) NOT NULL,
    resovle_date DATETIME NULL
);