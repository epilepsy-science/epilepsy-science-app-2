<template>
  <div class="about-page">
    <section class="body-wrapper mission-section">
      <h1 class="mission-title">{{ content.mission.title }}</h1>
    </section>

    <section class="body-wrapper stats-section">
      <div class="stats-container">
        <el-row class="stats-row">
          <el-col
            v-for="(stat, index) in displayStats"
            :key="index"
            :span="6"
            :xs="12"
            :md="6"
            class="stat-box"
          >
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </el-col>
        </el-row>
        <hr />
        <p class="stats-description">{{ content.statsDescription }}</p>
      </div>
    </section>

    <section class="body-wrapper what-we-do-section">
      <h2 class="section-title">{{ content.whatWeDo.title }}</h2>
      <div class="what-we-do-container">
        <el-row :gutter="20" class="stats-row">
          <el-col
            v-for="(text, index) in content.whatWeDo.textItems"
            :key="index"
            :span="12"
            :xs="24"
          >
            <p class="text-section">{{ text }}</p>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="body-wrapper mission-details-section">
      <h2 class="section-title">{{ content.missionDetails.title }}</h2>
      <p class="section-subtitle">{{ content.missionDetails.subtitle }}</p>
      <div class="content-container">
        <div class="text-column">
          <p class="bold-text mb-8">
            {{ content.missionDetails.additionalInfo }}
          </p>
          <p class="mb-8">{{ content.missionDetails.introduction }}</p>
          <p class="bold-text mb-8">
            {{ content.missionDetails.highlightsTitle }}
          </p>
          <ul class="highlights">
            <li
              v-for="(highlight, index) in content.missionDetails.highlights"
              :key="index"
            >
              {{ highlight }}
            </li>
          </ul>
          <p class="bold-text">{{ content.missionDetails.footer }}</p>
        </div>

        <div class="image-column">
          <img
            :src="content.missionDetails.imageSrc"
            alt="Epilepsy data platform"
          />
        </div>
      </div>
    </section>

    <section class="body-wrapper collaboration-section">
      <h2 class="collaboration-title">
        {{ collaboratorSectionContent.title }}
      </h2>
      <p class="collaboration-subtitle">
        {{ collaboratorSectionContent.subtitle }}
      </p>

      <div class="cards-container">
        <el-carousel type="card" :interval="6000">
          <el-carousel-item
            v-for="(card, index) in collaboratorSectionContent.cards"
            :key="index"
          >
            <CollaboratorCard
              :title="card.title"
              :description="card.description"
              :link="card.link"
            />
          </el-carousel-item>
        </el-carousel>
      </div>
    </section>
    <section class="body-wrapper team-section">
      <Team />
    </section>
    <!-- TODO: display this form once the endpoint to accept form submissions is available -->
    <!-- <section class="body-wrapper collaboration-form">
    <h2 class="collaboration-form-title"> We'd LOVE to collaborate! </h2>
    <p class="collaboration-form-subtitle"> What excites you about partnering? </p>
    <CollaboratorForm />
  </section> -->
  </div>
</template>

<script setup>
import { useMainStore } from "~/store/index";
import {
  aboutPageContent,
  aboutCollaboratorsContent,
} from "../../assets/content/aboutPageContent";
import { ref } from "vue";
import Team from "./team/team.vue";

const stats = useMainStore().pageStats;
const content = ref(aboutPageContent);
const collaboratorSectionContent = ref(aboutCollaboratorsContent);

const displayStats = [
  { value: `${stats.files}`, label: "Files" },
  { value: `${stats.labs}+`, label: "Labs" },
  { value: `${stats.datasets}`, label: "Datasets" },
  { value: `${stats.publicUsers}+`, label: "Public Users" },
];
</script>

<style scoped lang="scss">
.about-page {
  max-width: 1024px;
  margin: 0 auto;

  .section-title {
    text-align: center;
  }
}

.body-wrapper {
  padding-inline: 32px;
  margin-top: 72px;

  &:last-of-type {
    margin-bottom: 72px;
  }
}

.mission-section {
  text-align: center;

  .mission-title {
    color: #297fca;
    text-transform: none;
  }
}

.stats-section {
  background-color: #f0f0f0;
  border-radius: 10px;

  .stats-container {
    text-align: center;
    padding: 20px;
  }

  .stats-row {
    justify-content: center;
  }

  .stat-box {
    text-align: center;
    padding: 20px;

    .stat-value {
      font-size: 40px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }

    .stat-label {
      font-size: 16px;
    }
  }
}

.what-we-do-section {
  padding: 20px;
  color: #297fca;

  .what-we-do-container {
    margin-top: 24px;
  }
}

.mission-details-section {
  background-color: #297fca;
  color: white;
  padding: 40px;

  .section-subtitle {
    font-size: 16px;
    margin-bottom: 32px;
    line-height: 1.5;
    text-align: center;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .text-column {
    flex: 1;

    .bold-text {
      font-weight: bold;
    }

    .mb-8 {
      margin-bottom: 8px;
    }

    .highlights {
      list-style-type: disc;
      font-size: 14px;

      li {
        margin-bottom: 8px;
      }
    }
  }

  .image-column {
    flex: 1;
    text-align: center;

    img {
      width: 250px;
      height: 500px;
    }
  }
}

@media (min-width: 1024px) {
  .mission-section {
    text-align: center;
    padding-inline: 0;
    margin-top: 72px;
  }

  .stat-box {
    padding: 30px;
  }

  .mission-details-section .content-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .mission-details-section.body-wrapper {
    padding-inline: 32px;
  }

  .body-wrapper {
    padding-inline: 0px;
  }
}

.collaboration-section {
  text-align: center;

  .collaboration-title {
    color: #297fca;
  }

  .collaboration-subtitle {
    font-size: 24px;
    margin-bottom: 20px;
    color: #000;
  }
}

// TODO: display this form once the endpoint to accept form submissions is available
// .collaboration-form {
//   text-align: center;

//   .collaboration-form-title {
//     color: #297fca;
//   }

//   .collaboration-form-subtitle {
//     font-size: 24px;
//     margin-bottom: 32px;
//   }
// }
</style>

<style lang="scss">
.stats-row .stat-box:nth-child(3)::after {
  content: "coming soon!";
  background-color: #f9f9f9;
  color: #666;
  font-size: 0.75rem;
  font-weight: bold;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 2px 6px;
  margin-left: 5px;
}
</style>
