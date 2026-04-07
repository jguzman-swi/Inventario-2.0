const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP started, uploading...');
    
    // Upload tarball
    sftp.fastPut('/Users/gabriel/Documents/AntiGravity/Inventario/deploy.tar.gz', '/tmp/deploy.tar.gz', (err) => {
      if (err) throw err;
      console.log('Upload tarball complete!');
      
      // Upload DB backup separately
      sftp.fastPut('/Users/gabriel/Documents/AntiGravity/Inventario/database_backup.sql', '/tmp/database_backup.sql', (err) => {
        if (err) throw err;
        console.log('Upload DB complete! Running setup commands...');
        
        conn.exec('sudo -S bash -s', (err, stream) => {
          if (err) throw err;
          let outBuffer = '';
          let passSent = false;
          
          const checkPrompt = () => {
            if (!passSent && outBuffer.includes('password for administrator')) {
              passSent = true;
              setTimeout(() => {
                stream.write('V4@qL8#sH1!nZ6\\n');
                setTimeout(() => {
                  stream.write(`set -e
mkdir -p /opt/subway_inventory
tar -xzf /tmp/deploy.tar.gz -C /opt/subway_inventory
cp /tmp/database_backup.sql /opt/subway_inventory/
cd /opt/subway_inventory/api
cat << 'ENV' > .env
DB_HOST=127.0.0.1
DB_USER=inventario-user
DB_PASSWORD='7M\\$Cj63\\$Hr9'
DB_NAME=subway_inventory
PORT=3005
ENV
npm install
npm install -g pm2
mysql -u inventario-user -p'7M\\$Cj63\\$Hr9' -e "CREATE DATABASE IF NOT EXISTS subway_inventory;"
mysql -u inventario-user -p'7M\\$Cj63\\$Hr9' subway_inventory < ../database_backup.sql
pm2 stop subway-inventory || true
pm2 start server.js --name subway-inventory
pm2 save
`);
                  stream.end();
                }, 1500);
              }, 500);
            }
          };

          stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
          }).on('data', (data) => {
            const str = data.toString();
            process.stdout.write(str);
            outBuffer += str;
            checkPrompt();
          }).stderr.on('data', (data) => {
            const str = data.toString();
            process.stdout.write(str);
            outBuffer += str;
            checkPrompt();
          });
        });
      });
    });
  });
}).on('error', (err) => {
  console.log('Connection Error:', err);
}).connect({
  host: '63.141.255.231',
  port: 22,
  username: 'administrator',
  password: 'V4@qL8#sH1!nZ6',
  readyTimeout: 60000
});
