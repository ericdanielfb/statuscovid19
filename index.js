require('dotenv').config();
var express = require('express');
var Twit = require('twit');
var axios = require('axios').default;
var moment = require('moment');
var infos;
var infos_old;
const PORT = process.env.PORT || 3000;
var app = express();
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
moment.locale('pt-BR');
const Bot = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});
console.log('Bot inicializado.');
function BotInit() {
    var daily_deaths;
    axios.get('https://brasil.io/covid19/historical/daily/').then(
        response => {
            daily_deaths = response.data.from_states.new_deaths[response.data.from_states.new_deaths.length-1];
        }
    );
    axios.get('https://brasil.io/covid19/cities/cases/').then(
        response => {
            infos = response.data.total;
            var tweet = `Informações do Brasil` +
                `\n\nCasos confirmados: ${infos.confirmed.toLocaleString('pt-BR').replace(',', '.')}` +
                `\nMortes registradas (acumulado): ${infos.deaths.toLocaleString('pt-BR').replace(',', '.')}` +
                `\nMortes registradas (dia): ${daily_deaths}` +
                `\nPercentual de letalidade: ${infos.death_rate_percent.toFixed(2)}%` +
                `\n\nDados referentes a ${moment(infos.date_str).format('LL')}.` +
                `\nFonte: https://brasil.io/` +
                `\n\n#COVID19 #CORONAVIRUS #BRASIL #BRAZIL`
            if (infos_old === undefined || infos.confirmed !== infos_old.confirmed) {
                Bot.post('statuses/update', { status: tweet }, function (err, data, response) {
                    !err ? console.log(tweet) : console.log(data);
                    infos_old = infos;
                })
                console.log(tweet);
            } else {
                console.log("Informação não foi atualizada.");
            }
            axios.get('https://statuscovid19br.herokuapp.com/').catch(
                _ => {
                    console.log("Reinicializando Dyno.")
                }
            );
        }
    );
}
infos_old === undefined ? BotInit() : null
setInterval(BotInit, 20 * 60 * 1000);