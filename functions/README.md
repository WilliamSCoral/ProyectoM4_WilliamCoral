# functions/

Vercel Functions (backend serverless). Aquí vivirá `api/send-email.ts`,
que actúa como intermediario seguro (patrón BFF) entre el frontend y AWS
SES: recibe la solicitud del navegador, valida el input y usa las
credenciales de AWS (guardadas como variables de entorno del lado del
servidor, sin prefijo VITE_) para enviar el email. El frontend nunca ve
las claves de AWS. Se completa en el Hito 7 (Email con AWS SES).
