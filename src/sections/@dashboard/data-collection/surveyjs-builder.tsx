import { useTheme } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-core/survey-core.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import surveyJsTheme from '../template/edit/tabs/surveyjstheme';

export default function SurveyjsBuilder() {
  const theme = useTheme();

  const creator = useMemo(
    () =>
      new SurveyCreator({
        collapseOnDrag: true,
      }),
    []
  );

  // Apply our custom Material Design theme
  useEffect(() => {
    creator.applyCreatorTheme(surveyJsTheme(theme));
  }, [creator, theme]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const banner = document.querySelector('.svc-creator__banner');
          if (banner) {
            banner.remove();
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // creator.onSurveyInstanceCreated.add((_, { area, obj, survey }) => {
  //   if (area === 'property-grid') {
  //     survey.getPanelByName('showOnCompleted').visible = false;
  //     survey.getPanelByName('timer').visible = false;
  //   }
  // });

  return <SurveyCreatorComponent creator={creator} />;
}
