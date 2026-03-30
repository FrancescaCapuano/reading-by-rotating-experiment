# 1) Read data
# 2) Demographics
# 3) Data cleaning
# 4) Error rate analysis
# 5) Reaction time analysis
# 6) Hand on lid

rm(list = ls())

# libraries and functions
library(plyr)
library(dplyr)
library(readr)
library(stringr)
library(data.table)
library(lmerTest)
library(Rmisc)
library(scales)
library(ggplot2)
library(ggpattern)
library(ggsignif)

######## 1. Read data ########
# Set working dir
this.dir <- dirname(rstudioapi::getActiveDocumentContext()$path)
setwd(this.dir)

# Read all participants files in one dataframe
participants.files <- list.files(path="../data", pattern="Subject*", full.names=TRUE)
df <- ldply(participants.files, read_csv)
participants.dfs <- list()

for (i in seq_along(participants.files)) {
  # read participants' files one at a time
  participant.df <- read.csv(participants.files[[i]])
  
  # add age
  age <- participant.df$response[participant.df$trial_index ==1]
  participant.df$age <- as.numeric(str_extract_all(age,"(?<=Q0\":\").+(?=\"\\})"))
  
  # add gender
  gender <- participant.df$response[participant.df$trial_index==2]
  participant.df$gender <- as.character(str_extract_all(gender,"(?<=Q0\":\").+(?=\"\\})"))

  # add language
  language <- participant.df$response[participant.df$trial_index==3]
  participant.df$language <- as.character(str_extract_all(language,"(?<=Q0\":\").+(?=\"\\})"))
  
  # add hand on lid THIS NEEDS TO BE DOUBLE CHECKED IF IT WORKS FOR EVERY SUBJECT
  participant.df$hand_on_lid <- participant.df[nrow(participant.df) - 1,]$response
  participant.df$hand_on_lid[participant.df$hand_on_lid == "1"] <- "right"
  participant.df$hand_on_lid[participant.df$hand_on_lid == "0"] <- "left"

  # add mouse vs trackpad
  mouse.or.trackpad <- participant.df[nrow(participant.df),]$response
  participant.df$mouse_or_trackpad <- as.character(str_extract_all(mouse.or.trackpad,'(?<=\\{"MouseTrackpad":").+(?="\\})'))

  # append to list of dfs
  participants.dfs[[i]] <- participant.df
}

# merge all dfs into one
df <- rbindlist(participants.dfs, use.names = TRUE)

# 60 datafiles
length(unique(df$subject))

# rename turn direct to keep it uniform with other experiment
names(df)[names(df) == "rotation_direction"] <- "turn_direct"
df$turn_direct <- revalue(df$turn_direct, c("counterclockwise"="CCW", "clockwise"="CW"))



######## 2. Demographics ########
# Demographics
demographics <- df |> 
  group_by(subject) |>
  summarise(age = unique(age),
            gender = unique(gender),
            language = unique(language),
            hand_on_lid = unique(hand_on_lid))
# gender
table(demographics$gender)
# age
range(demographics$age)
mean(demographics$age)
sd(demographics$age)
# language
table(demographics$language)
# hand_on_lid
table(demographics$hand_on_lid)


######## 3. Data Cleaning ########
# Subjects who used the trackpad?
device <- group_by(df, subject, mouse_or_trackpad) %>%
  summarise(mouse.or.trackpad = unique(mouse_or_trackpad))
table(device$mouse.or.trackpad)
# df <- df[df$mouse_or_trackpad == "Touchpad",]

## COMPREHENSION QUESTIONS Accuracy
# Transform correctness to boolean to calculate mean
df$correctness <- as.logical(df$correctness)

# Select comprehension questions
df.questions <- df[df$question == "true",]
group_by(df.questions, subject) %>%
  summarise(count = n()) %>%
  filter(count != 30)
## there are 30 comprehension questions per subject

# Calculate what is above chance accuracy
p.correct <- function(n,k,p){
  factorial(n) / (factorial(k) * factorial(n - k)) *
    p^k * (1-p)^(n-k)
}
p.correct(30, 20, .5)
20/30
## 0.6666667

# Calculate comprehension questions accuracy by subject
questions.accuracy <- group_by(df.questions, subject) %>%
  summarise(accuracy = mean(correctness))
range(questions.accuracy$accuracy)

# # Exclude subjects if their accuracy is not above chance
to.exclude <- questions.accuracy$subject[questions.accuracy$accuracy < 20/30]
# df <- df[!df$subject %in% to.exclude,]
length(unique(df$subject))

## CRITICAL BUTTONS Accuracy

# Select only sentence frames 
df.frames <- df[df$item != "",]
group_by(df.frames, subject) %>%
  summarise(count = n())
## there are 1242 frames per subject

# Select only critical frames
df.critical <- df[df$trial_type == "knob-drag-response",]
group_by(df.critical, subject) %>%
  summarise(count = n())
## there are 48 frames per subject

# Calculate what is above chance accuracy
p.correct(48, 29, .5)
29/48
## 0.6041667

# Define correctness
participant_turned_clockwise <- function(angles_string){
  angles_string <- substring(angles_string[[1]], 2, nchar(angles_string[[1]])-1)
  return(TRUE %in% as.list(as.numeric(strsplit(angles_string, ",")[[1]]) > 0))
}
df.critical$turned_clockwise <- lapply(df.critical$angles, participant_turned_clockwise)

participant_turned_counter <- function(angles_string){
  angles_string <- substring(angles_string[[1]], 2, nchar(angles_string[[1]])-1)
  return(TRUE %in% as.list(as.numeric(strsplit(angles_string, ",")[[1]]) < 0))
}
df.critical$turned_counter <- lapply(df.critical$angles, participant_turned_counter)

df.critical$correctness <- TRUE
df.critical$correctness[df.critical$turn_direct == "CW" & df.critical$turned_counter == TRUE] <- FALSE
df.critical$correctness[df.critical$turn_direct == "CCW" & df.critical$turned_clockwise == TRUE] <- FALSE

# Calculate critical buttons accuracy by subject --> needs redefining
buttons.accuracy <- group_by(df.critical, subject) %>%
  summarise(accuracy = mean(correctness))
range(buttons.accuracy$accuracy)

# # Exclude subjects if their accuracy is not above chance
to.exclude <- buttons.accuracy$subject[buttons.accuracy$accuracy < 29/48]
df.critical <- df.critical[!df.critical$subject %in% to.exclude,]
length(unique(df.critical$subject))

# If randomisation worked correctly, there should be approx same amount of obs 
group_by(df.critical, verb, turn_direct) %>%
  summarise(count = n())

# OUTLIERS??
boxplot(df.critical$end_rt)
df.critical <- df.critical[df.critical$end_rt < 20000,]
boxplot(df.critical$end_rt)
hist(df.critical$end_rt, breaks = 100)
df.critical <- df.critical[df.critical$end_rt < 5000,]
boxplot(df.critical$end_rt)
boxplot(df.critical$start_rt)

df.critical <- group_by(df.critical, subject, turn_direct, verb) |>
  mutate(z_start = scale(start_rt),
         z_end = scale(end_rt))
df.critical <- df.critical[df.critical$z_start <= 2.5 & df.critical$z_start >= -2.5,]
df.critical <- df.critical[df.critical$z_end <= 2.5 & df.critical$z_end >= -2.5,]
boxplot(df.critical$start_rt)
boxplot(df.critical$end_rt)



######## 4. Error Rate Analysis ########
# Calculate errors
df.critical$error <- abs(df.critical$correctness - 1)

# Factors
df.critical$verb <- as.factor(df.critical$verb)
df.critical$subject <- as.factor(df.critical$subject)
df.critical$turn_direct <- as.factor(df.critical$turn_direct)
df.critical$item <- as.factor(df.critical$item)

# Plot
to.plot <- data.frame(summarySEwithin(data=df.critical, measurevar = 'error', withinvars = c('turn_direct', 'verb'), idvar = 'subject'))
to.plot$error.rate <- to.plot$error * 100
to.plot

jpeg(file="figures/errors.jpeg",
    width=600, height=350)

ggplot(to.plot, aes(pattern=verb, y=error.rate, x=turn_direct)) + 
  geom_bar_pattern(aes(pattern=verb), position="dodge", stat="identity", fill="white", colour="black") +
  ylab("Error Rate") + xlab("Instructed Turn Direction") + labs(pattern="Verb") +
  theme_bw() +
  theme(text = element_text(size = 24)) +
  geom_errorbar(aes(ymin=error.rate-se*100, ymax=error.rate+se*100), width=.2,
                position=position_dodge(0.9)) +
  coord_cartesian(ylim = c(0,12.5)) 

dev.off()

# glmer
fit <- glmer(error ~ verb * turn_direct +
               (1|item) +
               (1|subject) ,
             data = df.critical, family = "binomial")

summary(fit)




######## 5. Start RT Analysis ########
# Select only correct responses
df.critical <- df.critical[df.critical$correctness == 1,]

# Plot means
to.plot <- data.frame(summarySEwithin(data=df.critical, measurevar = 'start_rt', withinvars = c('turn_direct', 'verb'), idvar = 'subject'))
to.plot

jpeg(file="figures/start_rts.jpeg",
     width=600, height=350)

ggplot(to.plot, aes(pattern=verb, y=start_rt, x=turn_direct)) + 
  geom_bar_pattern(aes(pattern=verb), position="dodge", stat="identity", fill="white", colour="black") +
  ylab("RT") + xlab("Instructed Turn Direction") + labs(pattern="Verb") +
  theme_bw() +
  theme(text = element_text(size = 24)) +
  geom_errorbar(aes(ymin=start_rt-se, ymax=start_rt+se), width=.2,
                position=position_dodge(0.9)) +
  coord_cartesian(ylim = c(1500,3000))

dev.off()

# lmer
fit <- lmer(start_rt ~ verb * turn_direct +
              (1|subject) +
              (1|item),
            data = df.critical)
summary(fit)



######## 5. End RT Analysis ########
# Plot means
to.plot <- data.frame(summarySEwithin(data=df.critical, measurevar = 'end_rt', withinvars = c('turn_direct', 'verb'), idvar = 'subject'))
to.plot

jpeg(file="figures/end_rts.jpeg",
     width=600, height=350)

ggplot(to.plot, aes(pattern=verb, y=end_rt, x=turn_direct)) + 
  geom_bar_pattern(aes(pattern=verb), position="dodge", stat="identity", fill="white", colour="black") +
  ylab("RT") + xlab("Instructed Turn Direction") + labs(pattern="Verb") +
  theme_bw() +
  theme(text = element_text(size = 24)) +
  geom_errorbar(aes(ymin=end_rt-se, ymax=end_rt+se), width=.2,
                position=position_dodge(0.9)) +
  coord_cartesian(ylim = c(1500,3000))

dev.off()

# lmer
fit <- lmer(end_rt ~ verb * turn_direct +
              (1 + verb * turn_direct|subject) +
              (1 + turn_direct|item),
            data = df.critical)
summary(fit)



######## 6. Hand on lid ########
# Subjects per hand on lid
table(demographics$hand_on_lid)

# Factors
df.critical$hand_on_lid <- as.factor(df.critical$hand_on_lid)

# 3 way interaction (verb * turn_direct * hand.on.lid) START
fit <- lmer(start_rt ~ verb * turn_direct * hand_on_lid + 
              (1 + verb * turn_direct|subject) +
              (1|item),
            data = df.critical)
summary(fit)
anova(fit)

# 3 way interaction (verb * turn_direct * hand.on.lid) END
fit <- lmer(end_rt ~ verb * turn_direct * hand_on_lid + 
              (1 + verb * turn_direct|subject) +
              (1 + turn_direct|item),
            data = df.critical)
summary(fit)
anova(fit)

# Plot means START
to.plot <- data.frame(summarySEwithin(data=df.critical, measurevar = 'start_rt', withinvars = c('turn_direct', 'verb'), betweenvars = c("hand_on_lid"), idvar = 'subject'))
to.plot

jpeg(file="figures/hand_on_lid_start.jpeg",
    width=600, height=350)
ggplot(to.plot, aes(pattern=verb, y=start_rt, x=turn_direct)) + 
  geom_bar_pattern(aes(pattern=verb), position="dodge", stat="identity", fill="white", colour="black") +
  ylab("RT") + xlab("Turn Direction") + labs(pattern="Verb") +
  theme_bw() +
  theme(text = element_text(size = 24)) +
  geom_errorbar(aes(ymin=start_rt-se, ymax=start_rt+se), width=.2,
                position=position_dodge(0.9)) +
  coord_cartesian(ylim = c(1500,3000)) +
  facet_grid(~ hand_on_lid)
dev.off()

# Plot means END
to.plot <- data.frame(summarySEwithin(data=df.critical, measurevar = 'end_rt', withinvars = c('turn_direct', 'verb'), betweenvars = c("hand_on_lid"), idvar = 'subject'))
to.plot

jpeg(file="figures/hand_on_lid_end.jpeg",
     width=600, height=350)
ggplot(to.plot, aes(pattern=verb, y=end_rt, x=turn_direct)) + 
  geom_bar_pattern(aes(pattern=verb), position="dodge", stat="identity", fill="white", colour="black") +
  ylab("RT") + xlab("Turn Direction") + labs(pattern="Verb") +
  theme_bw() +
  theme(text = element_text(size = 24)) +
  geom_errorbar(aes(ymin=end_rt-se, ymax=end_rt+se), width=.2,
                position=position_dodge(0.9)) +
  coord_cartesian(ylim = c(1500,3000)) +
  facet_grid(~ hand_on_lid)
dev.off()
