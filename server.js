const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const express = require('express');
const client = new Discord.Client();
const app = express()

const token_bot = "ur key here"
const owner_id = "ur id"
const prefix = "?"
const database = 'database.json'
const basicdaily = 250
const port = 8080;
const version_bot = "1.2.1a (6/4/2021)"
let cooldown = new Set()
let cdsecond = 3;

const owner_question = ["What happen with toonrun?","is toonrun lazy?"]

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'Prefix: '+prefix,
            type: 'PLAYING',
        }
    })
}); 

function sortNumbers(a, b) {
    return a + b;
}

function print(message)
{
    console.dir(message)
}

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
  }
  
  function decode_utf8(s) {
    return decodeURIComponent(escape(s));
  }

function Find(UID)
{
    return new Promise((resolve,rejected) =>{
        jsonfile.readFile(database,function(err,body){
            if (err){
                throw err;
            }
            for (var i = 0; i < body.userdata.length; i++)
            {
                if (body.userdata[i].UID == UID)
                {
                    resolve({"stack":body.userdata[i],"location":i})
                }
            }
            resolve(null)
        })
    })
}


function Get()
{
    return new Promise((resolve,reject) =>{
        jsonfile.readFile(database,function(err,body)
        {
            if (err){
                throw err
            }
            else
            {
                resolve(body)
            }
            resolve(null)
        })
    })
}

function sendm(topic,msgc,message,color)
{
    const embed = new Discord.MessageEmbed()
    embed.setTitle(topic)
    embed.setColor(color)
    const table_string = message.split("||")
    embed.addField(table_string[0],table_string[1])
    msgc.channel.send(embed)
}

function isadmin(UID)
{
    return new Promise((resolve,reject) =>{
        Find(UID).then((body) =>{
            if (UID == owner_id)
            {
                resolve({"code":1})
            }
            if (body.stack && body.stack.isadmin == true)
            {
                resolve({"code":1})
            }
            else
            {
                resolve({"code":-1})
            }
        })
    })
}

function setvalue(UID,UPDATE,TO)
{
    return new Promise((resolve,reject) =>{
        Find(UID).then((body) =>{
            if (body != null)
            {
                Get().then((obj) =>{                    
                    const new_table = obj
                    const userbodydata = new_table.userdata[body.location]

                    userbodydata[UPDATE] = TO

                    jsonfile.writeFile(database, new_table, function (err) {
                        if (err) resolve({"code":-1,"stack":"error."})
                        resolve({"code":1,"stack":"complete."})
                     })
                })
            }
        })
    })
}

function tradecoin(UID,UID_TARGET,COIN_TRADE)
{
    return new Promise((resolve,reject) =>{
        Find(UID).then((body) =>{
            if (body != null)
            {
                Find(UID_TARGET).then((body_target) =>{
                    if (body_target != null)
                    {
                        Get().then((obj) =>{           
                            const new_table = obj
                            const userbodydata = new_table.userdata[body.location]
                            const target_userbodydata = new_table.userdata[body_target.location]
                            
                            userbodydata.coin -= COIN_TRADE
                            target_userbodydata.coin += COIN_TRADE

                            jsonfile.writeFile(database, new_table, function (err) {
                                if (err) console.error(err)
                            }) 
                            resolve({"code":1,"stack":"success"})
                        })
                    }
                    else
                    {
                        resolve({"code":-2,"stack":"target doesn't have account"})
                    }
                })
            }
            else
            {
                resolve({"code":-1,"stack":"user doesn't have account"})
            }
        })
    })
}

function addcoin(UID,coin)
{
    return new Promise((resolve,reject) =>{
        Find(UID).then((body) =>{
            if (body != null)
            {
                Get().then((obj) =>{                    
                    const new_table = obj
                    const userbodydata = new_table.userdata[body.location]
                    const oldcoin = userbodydata.coin
                    const newcoin = (Number(oldcoin) + Number(coin))
                    userbodydata.coin = newcoin
                    jsonfile.writeFile(database, new_table, function (err) {
                        if (err) console.error(err)
                    }) 
                })
                resolve("do now")
            }
        })
    })
}

function removecoin(UID,coin)
{
    return new Promise((resolve,reject) =>{
        Find(UID).then((body) =>{
            if (body.stack)
            {
                Get().then((obj) =>{                    
                    const new_table = obj
                    const userbodydata = new_table.userdata[body.location]
                    const oldcoin = userbodydata.coin
                    const newcoin = (Number(oldcoin) - Number(coin))
                    userbodydata.coin = newcoin
                    jsonfile.writeFile(database, new_table, function (err) {
                        if (err) console.error(err)
                    }) 
                    resolve("do now")
                })
            }
        })
    })
}

function setcoin(UID,coin)
{
    Find(UID).then((body) =>{
        if (body.stack)
        {
            Get().then((obj) =>{                    
                    const new_table = obj
                    const userbodydata = new_table.userdata[body.location]
                    const newcoin = (coin)
                    userbodydata.coin = newcoin
                    jsonfile.writeFile(database, new_table, function (err) {
                        if (err) console.error(err)
                    }) 
            })
        }
    })
}

function noaccountcase(UID)
{
    Get().then((obj) =>{
        const new_table = obj
        const unix = Date.now();
        const date = new Date(unix)
        const dateing = date.toLocaleDateString("EN-US").split("/")

        const day = dateing[1]
        const month = dateing[0]
        const year = dateing[2]
        new_table.userdata.push({
            "UID":UID,
            "coin":0,
            "streak":0,
            "datedaily":"00/00/0000",
            "createat":day+"/"+month+"/"+year,
            "banreason":"null",
            "inventory": {},
            "link":{},
            "isadmin":false,
            "isbanned":false
        })
        jsonfile.writeFile(database, new_table, function (err) {
            if (err) console.error(err)
        })
    })
}

function daily(UID,message,username)
{
    Find(UID).then((body) =>{
        if (body != null)
        {
            const coingot = (basicdaily + ((body.stack.streak * 100)+50))

            const unix = Date.now();
            const date = new Date(unix)
            const dateing = date.toLocaleDateString("EN-US").split("/")

            const day = dateing[1]
            const month = dateing[0]
            const year = dateing[2]

            Get().then((obj) =>{                    
                const new_table = obj
                const userbodydata = new_table.userdata[body.location]
                
                const old_date = userbodydata.datedaily.split("/")

                const old_day = old_date[0]
                const old_month = old_date[1]
                const old_year = old_date[2]

                let allthing = 0;

                if (old_day > day)
                {
                    allthing = old_day - day
                }
                if (old_day < day)
                {
                    allthing = day - old_day
                }

                if (allthing == 1 || month != old_month || year != old_year)
                {
                    sendm("Daily",message,username+" got || "+coingot+" Catcoin! ("+(userbodydata.streak+1)+" streak)","#00FF00")
                    const oldcoin = userbodydata.coin
                    const newcoin = (Number(oldcoin) + Number(coingot))
                    userbodydata.datedaily = day+"/"+month+"/"+year
                    userbodydata.streak += 1
                    userbodydata.coin = newcoin
                    jsonfile.writeFile(database, new_table, function (err) {
                        if (err) console.error(err)
                    }) 
                }
                else
                if (allthing == 0)
                {
                    sendm("Daily",message,username+" Already get daily! || Dont forgot!","#00FF00")
                }
                else
                {
                    sendm("Daily",message,username+" got || "+coingot+" Catcoin! (0 streak)","#00FF00")
                    const oldcoin = userbodydata.coin
                    const newcoin = (Number(oldcoin) + Number(coingot))
                    userbodydata.datedaily = day+"/"+month+"/"+year
                    userbodydata.coin = newcoin
                    userbodydata.streak = 0
                    jsonfile.writeFile(database, new_table, function (err) {
                        if (err) console.error(err)
                    }) 
                }
            })

        }
        else
        {
            sendm("No Account!",message,"We setup for your account complete. || Please repeat again.","#FF0000")
            noaccountcase(UID)
        }
    })
}

function luck(UID,message,username,args)
{
    Find(UID).then((body) =>{
        if (body != null)
        {
            if (args[0] != null && Number(args[0]) && args[0] >=1)
            {
                var gifmacoin = args[0] //that are coin gonna luckshuffle.
                gifmacoin = Math.floor(gifmacoin)
                if (body.stack.coin >= gifmacoin)
                {
                    const userbodydata = body.stack

                    var coin_got_from_random = Math.floor(Math.random()*(gifmacoin+gifmacoin))

                    userbodydata.coin -= gifmacoin
                    userbodydata.coin += coin_got_from_random

                    setvalue(UID,"coin",userbodydata.coin)

                    var embed = new Discord.MessageEmbed()
                    embed.setTitle("Luckshuffle!")
                    embed.setColor("#990099")
                    embed.addField(username+" got",coin_got_from_random+" Catcoin!")
                    embed.addField(username+"'s now Catcoin",userbodydata.coin+" Catcoin!")
                    message.channel.send(embed)
                }
                else
                {
                    sendm("Error!",message,"you have Catcoin not Enough! || luckshuffle <catCoin>","#FF0000")
                }
            }
            else
            {
                sendm("Error!",message,"Please insert your Coin for luckshuffle || luckshuffle <catCoin>","#FF0000")
            }
        }
        else
        {
            sendm("No Account!",message,"We setup for your account complete. || Please repeat again.","#FF0000")
            noaccountcase(UID)
        }
    })
}

function getuserbyuid(UID)
{
    return new Promise((resolve,reject) =>{
        resolve(client.users.cache.get(UID))
    })
}

function getleaderboard()
{
    Get().then((body) =>{
        const embed = new Discord.MessageEmbed()
        let usertop = {}
        let moneytop = {}
        for (var i = 0; i < body.userdata.length; i++)
        {
            getuserbyuid(body.userdata[i].UID).then((user) =>{
                if (user)
                {
                    const udata = body.userdata[i]
                    usertop10[udata.UID] = udata.coin
                    moneytop[i] = udata.coin
                }
            })
        }
        moneytop.sort(sortNumbers)
        console.log(moneytop)
    })
}

function pay(UID,message)
{
    var mention = message.content.split(" ")
        var coin = mention[2]
        if (coin == " " || coin == "")
        {
            coin = Math.floor(mention[3])
        }
        var m2 = mention[1].split("!")
        var m3 = m2[1].split(">")
        mention = m3[0]
        if (coin != null && coin >= 1)
        {
            tradecoin(UID,mention,coin).then((res) =>{
                if (res != null)
                {
                    if (res.code == 1)
                    {
                        sendm("Complete!",message,"Payment success! || ...","#00FF00")
                    }
                    else
                    if (res.code == -1)
                    {
                        sendm("No Account!",message,"We setup for your account complete. || Please repeat again.","#FF0000")
                        noaccountcase(UID)
                    }
                    else
                    if (res.code == -2)
                    {
                        sendm("No Account!",message,"Target doesn't have account!. || ...","#FF0000")
                    }
                }
            })
        }
        else
        {
            sendm("Error!",message,"Please insert your Coin for pay || pay <Target> <Cash>","#FF0000")
        }
}

client.on('message', message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    var args = message.content.slice(prefix.length).trim().split(/ +/g);
    var cmd = args.shift().toLowerCase();
    var user = message.author
    var username = message.author.username
    var UID = message.author.id

    client.users.fetch(UID).then((useless) =>
    {
        Find(UID).then((body) =>
        {
            if (body != null)
            {
                if (body.stack.isbanned == false)
                {
                    if (!cooldown.has(message.author.id))
                    {
                        cooldown.add(message.author.id)
                        if (cmd == "coin")
                        {
                            Find(UID).then((body) =>{
                                if (body != null)
                                {
                                    sendm("Catcoin!",message,username+"'s Catcoin || "+body.stack.coin+" Catcoin!","#00FF00");
                                }
                                else
                                {
                                    sendm("Near Complete!",message,"I want you repeat that word again! || Do it!","#FF0000")
                                    noaccountcase(UID)
                                }
                            })
                        }
                        else
                        if (cmd == "daily")
                        {
                            daily(UID,message,username)
                        }
                        if (cmd == "question")
                        {
                            const random = Math.floor(Math.random() * owner_question.length);
                            const questiontada = owner_question[random]

                            sendm("My question!",message,questiontada+" ||...","#FFFF00")
                        }
                        if (cmd == "source")
                        {
                            message.channel.send('https://github.com/toonrun123/discord-bot-open-source');
                        }
                        else
                        if (cmd == "noyes")
                        {
                            const question = args[0]
                            const embed = new Discord.MessageEmbed()
                            const random = Math.random * 2
                            if (question)
                            {
                                if (random >=2)
                                {
                                    embed.setTitle(question)
                                    embed.setColor("#990099")
                                    embed.addField("Yes.","")
                                    message.channel.send(embed)
                                }
                                else
                                {
                                    embed.setTitle(question)
                                    embed.setColor("#990099")
                                    embed.addField("No.","")
                                    message.channel.send(embed)
                                }
                            }
                            else
                            {
                                sendm("Question!",message,"You don't ask any question! ||I want question!~","#FF0000")
                            }
                        }
                        else
                        if (cmd == "cmd" || cmd == "cmds")
                        {
                            const embed = new Discord.MessageEmbed()
                            embed.setTitle("All Commands!")
                            embed.setColor("#990099")
                            embed.addField("ping","for check your ping and bot!")
                            embed.addField("daily","For get daily!")
                            embed.addField("coin","For looking your Catcoins!")
                            embed.addField("luckshuffle <Coin>","Random your Catcoins!")
                            embed.addField("pay <To> <Cash>","Pay Catcoin to target account!")
                            embed.addField("noyes <question>","Bot will say yes and no.")
                            embed.addField("question","owner question!")
                            embed.addField("source","open source code this bot!")
                            embed.addField("credit","who build this bot??")
                            embed.addField("version","Get this version bot.")
                            message.channel.send(embed);
                        }
                        else
                        if (cmd == "admincmd" || cmd == "admincmds")
                        {
                            isadmin(UID).then((res) =>{
                                if (res.code == 1)
                                {
                                    const embed = new Discord.MessageEmbed()
                                    embed.setTitle("All Admins Commands!")
                                    embed.setColor("#990099")
                                    embed.addField("ban <UID> <REASON>","Ban people.")
                                    embed.addField("unban <UID>","unBan people.")
                                    message.channel.send(embed);
                                }
                                else
                                {
                                    sendm("Access Denied.",message,"Reason: ||you not allowed use this command.","FF0000")
                                }
                            })
                        }
                        else
                        if (cmd == "giveadmin")
                        {
                            if (UID == owner_id)
                            {
                                var UID_TARGET = args[0]
                                if (UID == owner_id)
                                {
                                    if (UID_TARGET)
                                    {
                                        setvalue(UID,"isadmin",true).then((useless) =>{
                                            sendm("CMD RUNNING.",message,"GIVE ADMIN COMPLETE. ||...","00FF00")
                                        })
                                    }
                                }
                                else
                                {
                                    sendm("CMD ERROR",message,"COMMAND: ||giveadmin <UID>.","FF0000")
                                }
                            }
                            else
                            {
                                sendm("Access Denied.",message,"Reason: ||owner bot can give only.","FF0000")
                            }
                        }
                        else
                        if (cmd == "credit")
                        {
                            message.channel.send('toonrun123#8729');
                        }
                        else
                        if (cmd == "ping")
                        {
                            const msg = message.channel.send('Pinging...');
                            msg.then((true_msg) =>{
                                true_msg.edit(`🏓 Pong\n<@${message.author.id}> Latency is ${Math.floor(true_msg.createdAt - message.createdAt)} ms. (${Math.floor(true_msg.createdAt - message.createdAt)/1000} Second.) \n🤖 Client Latency is ${Math.round(client.ws.ping)} ms. (${Math.round(client.ws.ping)/1000} Second.)`)
                            })
                        }
                        else
                        if (cmd == "luckshuffle")
                        {
                            luck(UID,message,username,args)
                        }
                        else
                        if (cmd == "pay")
                        {
                            pay(UID,message)
                        }
                        else
                        if (cmd == "version")
                        {
                            message.channel.send(version_bot)
                        }
                        else
                        if (cmd == "ban")
                        {
                            isadmin(UID).then((res) =>{
                                if (res.code == 1)
                                {
                                    var UID_TARGET = args[0]
                                    var BAN_REASON = args[1]
                                    if (UID_TARGET && BAN_REASON)
                                    {
                                        setvalue(UID_TARGET,"isbanned",true).then((tada) =>{
                                            setvalue(UID_TARGET,"banreason",BAN_REASON).then((tada2) =>{
                                                sendm("CMD RUNNING.",message,"BANNED COMPLETE. ||...","00FF00")
                                            })
                                        })
                                    }
                                    else
                                    {
                                        sendm("CMD ERROR",message,"ban <UID> <REASON> ||...","FF0000")
                                    }
                                }
                                else
                                {
                                    sendm("Access Denied.",message,"Reason: ||you not allowed use this command.","FF0000")
                                } 
                            })    
                        }
                        else
                        if (cmd == "unban")
                        {
                            isadmin(UID).then((res) =>{
                                if (res.code == 1)
                                {
                                    var UID_TARGET = args[0]
                                    if (UID_TARGET)
                                    {
                                        setvalue(UID_TARGET,"isbanned",false).then((tada) =>{
                                            sendm("CMD RUNNING.",message,"UNBANNED COMPLETE. ||...","00FF00")
                                        })
                                    }
                                    else
                                    {
                                        sendm("CMD ERROR",message,"unban <UID> ||...","FF0000")
                                    }
                                }
                                else
                                {
                                    sendm("Access Denied.",message,"Reason: ||you not allowed use this command.","FF0000")
                                } 
                            })   
                        }
                        else
                        if (cmd == "apis")
                        {
                            
                        }
                        else
                        if (cmd == "sad")
                        {
                            sendm("...",message,"why || why","#ffcc00")
                        }
                        setTimeout(() =>{
                            cooldown.delete(message.author.id)
                        }, cdsecond * 1000)
                    }
                    else
                    {
                        sendm("Cooldown!",message," Cooldown! || Please wait 3 Seconds!","#FF0000");
                    }
                }
                else
                {
                    sendm("Banned.",message,user.tag+" got banned reason: || "+body.stack.banreason,"#FF0000")
                    return;
                }
            }
            else
            {
                sendm("Near Complete!",message,"Repeat again. || ...","#FF0000")
                noaccountcase(UID)
            }
        })
    })

});

app.get('/databasediscordbot', function (req, res) {
    Get().then((body) =>{
        res.json(body)
    })
})

client.login(token_bot);
app.listen(port)
