
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors({origin: "*" }));
app.use(bodyParser.json());

app.listen(8080, () => {
    console.log("The server started on port 8080");
});

app.post("/sendmail/command", (req, res) => {
	console.log("request command came");
let mailInfo = req.body;
sendMail('Commande', mailInfo, (err, info) => {
	if (err) {
		console.log(err);
		res.status(400);
		res.send({ error: "Failed to send email" });
	} else {
		console.log("Email has been sent");
		res.send(info);
	}
});

});

app.post("/sendmail/contact", (req, res) => {
	console.log("request contact came");
let mailInfo = req.body;
sendMail('Contact', mailInfo, (err, info) => {
	if (err) {
		console.log(err);
		res.status(400);
		res.send({ error: "Failed to send email" });
	} else {
		console.log("Email has been sent");
		res.send(info);
	}
});

});

const sendMail = (type, mailInfo, callback) => {

	var transporter = nodemailer.createTransport({
		host: "sandbox.smtp.mailtrap.io",
		port: 2525,
		auth: {
			user: "{{user mailtrap}}",
			pass: "{{password mailtrap"
		}
	});

	let options = mailOptions

	options.html = html(type, mailInfo)
	options.from = `"${mailInfo.auth.firstName} ${mailInfo.auth.lastName}", "${mailInfo.auth.email}"`
	options.subject = type

	transporter.sendMail(options, callback);

}

const mailOptions = {
	from: `"", ""`,
	to: `pharmacie.mairie@test.ch`,
	subject: "",
	html: ""
};

const html = (type, mailInfo) => {
	console.log(mailInfo)

//	const dateCommand = new Date().toLocaleDateString("fr-FR")

return `
<!DOCTYPE html>
<html lang="fr">
	<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link href="style.css" rel="stylesheet">
	<style>
	.mail {
		margin: auto;
		max-width: 800px
	}
	
	.contact {
		width: 200px;
	}
	
	table {
		border-collapse: collapse;
	}
	
	.table-commands {
	
		width: 800px;
	
	}
	
	th {
		text-align: left;
		border: solid 1px black;
		padding-left: 5px;
	}
	
	td {
		border: solid 1px black;
		padding-left: 5px;
		padding-right: 5px;
	}
	
	.column-header-ref {
		width: 12%;
	}
	.column-header-label {
		width: 50%;
	}
	.column-header-qte {
		width: 6%;
	}
	.column-header-price {
		width: 12%;
	}
	.column-header-row-total {
		width: 12%;
	}
	
	.column-price {
		text-align: end;
	}
	
	.total-general {
		font-weight: 500;
		text-align: right;
	}
	</style>
	</head>
  <body>
    <div class="mail">
      <div>
        <table>
          <tr>
            <td>Nom</td>
            <td class="contact">${mailInfo.auth.lastName}</td>
          </tr>
          <tr>
            <td>Prénom</td>
            <td>${mailInfo.auth.firstName}</td>
          </tr>
          <tr>
            <td>Adr.</td>
            <td>${mailInfo.auth.address1}</td>
          </tr>
          <tr>
            <td>Adr. 2</td>
            <td>${mailInfo.auth.address2}</td>
          </tr>
          <tr>
            <td>Localité</td>
            <td>${mailInfo.auth.zip} ${mailInfo.auth.locality}</td>
          </tr>
        </table>
      </div>
			${type === 'Commande' ? rowCommand(mailInfo) : rowContact(mailInfo)}
    </div>
</body>
</html>
`
}

const rowContact = (mailInfo) => {

	const array = new Date().toUTCString().split(' ')
	const dateCommand = `${array[1]} ${array[2]} ${array[3]}`

	rows = ''

	mailInfo.message.split('\n').forEach(element => {
		rows += `<p>${element}</p>`
	});


	return `
	<h3>Contact Internet du ${dateCommand}</h3>
	<div>
	${rows}
	</div>
	`
}

const rowCommand = (mailInfo) => {

	const array = new Date().toUTCString().split(' ')
	const dateCommand = `${array[1]} ${array[2]} ${array[3]}`

	let rows = ''
	let total = 0
	
	const numberFormat1 = new Intl.NumberFormat('fr-FR')

	mailInfo.command.forEach(element => {
		rows += row(element)
		total += element.qte * element.product.price
	});

	const totalFormat = numberFormat1.format(total)

	return `
	<h3>Commande Internet du ${dateCommand}</h3>
	<table class="table-commands" cellspan="0" border="1">
		<tr>
			<th class="column-header-ref">Reference</th>
			<th class="column-header-label">Libellé</th>
			<th class="column-header-qte">Qté.</th>
			<th class="column-header-price">Prix Unit.</th>
			<th class="column-header-row-total">Total</th>
		</tr>
		${rows}
		<tr>
			<td colspan="4" class="total-general">Total des articles</td>
			<td class="column-price">${totalFormat} €</td>
		</tr>
	</table>
`

}

const row = (row) => {

	//const options1 = { style: 'currency', currency: 'EUR' }
	const numberFormat1 = new Intl.NumberFormat('fr-FR')

	const total = numberFormat1.format(row.product.price * row.qte)

	return `
<tr>
	<td>${row.product.id}</td>
	<td>${row.product.label}</td>
	<td  class="column-price">${row.qte}</td>
	<td class="column-price">${row.product.price} €</td>
	<td class="column-price">${total} €</td>
</tr>
`

}