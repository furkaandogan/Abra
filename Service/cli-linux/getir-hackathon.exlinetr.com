upstream live{
    server 127.0.0.1:5353;
}
upstream sandbox{
    server 127.0.0.1:5354;
}

server{
    listen 80 ;
    listen [::]:80;

    server_name getir-hackathon.exlinetr.com;

    location /live/ {
        rewrite /live/(.*) /$1  break;
        proxy_pass http://live;
    }

    location /{
        proxy_pass http://sandbox;
    }

    location /sandbox/ {
        rewrite /sandbox/(.*) /$1  break;
        proxy_pass http://sandbox;
    }

}