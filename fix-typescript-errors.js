const fs = require('fs');

// Fix clubs controller
const clubsContent = fs.readFileSync('src/controllers/clubs.ts', 'utf8');

// Add type guards for all methods that use req.params.id
const fixedClubsContent = clubsContent
  .replace(
    /export const updateClub = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id \} = req\.params;/g,
    `export const updateClub = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const deleteClub = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id \} = req\.params;/g,
    `export const deleteClub = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const getClubMembers = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id: clubId \} = req\.params;/g,
    `export const getClubMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: clubId } = req.params;

    if (!clubId) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const addClubMember = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id: clubId \} = req\.params;/g,
    `export const addClubMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: clubId } = req.params;

    if (!clubId) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const updateClubMember = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ clubId, userId \} = req\.params;/g,
    `export const updateClubMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clubId, userId } = req.params;

    if (!clubId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Club ID and User ID are required.',
      });
      return;
    }`
  )
  .replace(
    /export const removeClubMember = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ clubId, userId \} = req\.params;/g,
    `export const removeClubMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clubId, userId } = req.params;

    if (!clubId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Club ID and User ID are required.',
      });
      return;
    }`
  );

fs.writeFileSync('src/controllers/clubs.ts', fixedClubsContent);

// Fix teams controller
const teamsContent = fs.readFileSync('src/controllers/teams.ts', 'utf8');

const fixedTeamsContent = teamsContent
  .replace(
    /export const getTeam = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id \} = req\.params;/g,
    `export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const updateTeam = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id \} = req\.params;/g,
    `export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const deleteTeam = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id \} = req\.params;/g,
    `export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const getTeamMembers = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id: teamId \} = req\.params;/g,
    `export const getTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: teamId } = req.params;

    if (!teamId) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const addTeamMember = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ id: teamId \} = req\.params;/g,
    `export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: teamId } = req.params;

    if (!teamId) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }`
  )
  .replace(
    /export const updateTeamMember = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ teamId, userId \} = req\.params;/g,
    `export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, userId } = req.params;

    if (!teamId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Team ID and User ID are required.',
      });
      return;
    }`
  )
  .replace(
    /export const removeTeamMember = async \(req: Request, res: Response\): Promise<void> => \{[\s\S]*?const \{ teamId, userId \} = req\.params;/g,
    `export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, userId } = req.params;

    if (!teamId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Team ID and User ID are required.',
      });
      return;
    }`
  );

fs.writeFileSync('src/controllers/teams.ts', fixedTeamsContent);

console.log('✅ TypeScript errors fixed!');
