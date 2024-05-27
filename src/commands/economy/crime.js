import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Balance } from '../../schemas/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Commit a crime and risk it all.'),
  userPermissions: [],
  botPermissions: [],
  cooldown: 86400, // 1 hour cooldown
  nsfwMode: false,
  testMode: false,
  devOnly: false,

  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;

      // Fetch user's balance
      let userBalance = await Balance.findOne({ userId });
      if (!userBalance) {
        userBalance = new Balance({ userId });
      }

      // Determine the outcome of the crime
      const crimeOutcome = Math.random() < 0.6;
      const amount = Math.floor(Math.random() * 30) + 1; // Random amount between 1 and 30

      let crimeMessage = '';
      let color = '';

      if (crimeOutcome) {
        userBalance.balance += amount;
        crimeMessage = `Success! You committed a crime and earned ${amount} clienterr coins. Your balance is now ${userBalance.balance} clienterr coins.`;
        color = '#00FF00'; // Green for success
      } else {
        // Ensure balance doesn't go negative
        userBalance.balance = Math.max(userBalance.balance - amount, 0);
        crimeMessage = `Failure! You got caught and lost ${amount} clienterr coins. Your balance is now ${userBalance.balance} clienterr coins.`;
        color = '#FF0000'; // Red for failure
      }

      // Save the updated balance to the database
      await userBalance.save();

      // Create the embed message
      const rEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle('Crime Commitment')
        .setDescription(crimeMessage);

      // Reply with the embed message
      await interaction.reply({ embeds: [rEmbed] });
    } catch (error) {
      console.error('Error processing crime command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000') // Red color for error
        .setTitle('Error')
        .setDescription('There was an error processing your crime. Please try again later.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};