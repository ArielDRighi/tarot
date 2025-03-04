import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { TarotDeck } from './tarot/entities/tarot-deck.entity';
import { TarotCard } from './tarot/entities/tarot-card.entity';
import { TarotSpread } from './tarot/entities/tarot-spread.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const deckRepository = app.get(getRepositoryToken(TarotDeck));
  const cardRepository = app.get(getRepositoryToken(TarotCard));
  const spreadRepository = app.get(getRepositoryToken(TarotSpread));

  try {
    // Comprobar si ya hay datos cargados
    const decksCount = await deckRepository.count();
    const spreadsCount = await spreadRepository.count();

    if (decksCount === 0) {
      console.log('Cargando mazo inicial...');

      // Crear un mazo de tarot
      const deck = await deckRepository.save({
        name: 'Rider-Waite',
        description:
          'El Rider-Waite es uno de los mazos de tarot más populares y ampliamente reconocidos. Diseñado por Arthur Edward Waite e ilustrado por Pamela Colman Smith, fue publicado por primera vez en 1909. Sus imágenes ricas en simbolismo y sus interpretaciones accesibles lo han convertido en el estándar de referencia para muchos lectores de tarot.',
        imageUrl: 'https://ejemplo.com/mazos/rider-waite.jpg',
        cardCount: 78,
      });

      console.log(`Mazo "${deck.name}" creado con ID: ${deck.id}`);

      // Crearemos solo algunas cartas a modo de ejemplo
      const arcanosMayores = [
        {
          name: 'El Loco',
          number: 0,
          category: 'arcanos_mayores',
          imageUrl: 'https://ejemplo.com/cartas/el_loco.jpg',
          meaningUpright:
            'Nuevos comienzos, libertad, espíritu libre, aventura, potencial ilimitado',
          meaningReversed:
            'Imprudencia, toma de riesgos innecesarios, negligencia, caos',
          description:
            'El Loco representa un espíritu libre y aventurero, alguien en el umbral de un viaje o una nueva etapa en la vida. Sugiere potencial ilimitado pero también implica la necesidad de tener cuidado para no actuar impulsivamente.',
          keywords: 'Libertad, inocencia, espíritu libre, caos, aventura',
          deckId: deck.id,
        },
        {
          name: 'El Mago',
          number: 1,
          category: 'arcanos_mayores',
          imageUrl: 'https://ejemplo.com/cartas/el_mago.jpg',
          meaningUpright:
            'Manifestación, poder personal, acción inspirada, concentración, habilidad',
          meaningReversed:
            'Manipulación, talentos desperdiciados, engaño, inseguridad',
          description:
            'El Mago representa la habilidad de utilizar los recursos disponibles para manifestar tus deseos. Simboliza el poder de la voluntad, la concentración y el dominio de los elementos.',
          keywords: 'Voluntad, manifestación, poder, concentración, creación',
          deckId: deck.id,
        },
        {
          name: 'La Sacerdotisa',
          number: 2,
          category: 'arcanos_mayores',
          imageUrl: 'https://ejemplo.com/cartas/la_sacerdotisa.jpg',
          meaningUpright:
            'Intuición, sabiduría subconsciente, conocimiento divino, lo oculto',
          meaningReversed:
            'Secretos, información retenida, represión, superficialidad',
          description:
            'La Sacerdotisa representa la intuición y los misterios ocultos. Ella guarda conocimientos que no son evidentes a primera vista y sugiere la necesidad de confiar en la sabiduría interior.',
          keywords:
            'Intuición, misterio, conocimiento interior, lo oculto, paciencia',
          deckId: deck.id,
        },
      ];

      for (const cardData of arcanosMayores) {
        const card = await cardRepository.save(cardData);
        console.log(`Carta "${card.name}" creada con ID: ${card.id}`);
      }
    } else {
      console.log(
        `Ya existen ${decksCount} mazos en la base de datos. Saltando creación de mazos y cartas.`,
      );
    }

    if (spreadsCount === 0) {
      console.log('Cargando tiradas iniciales...');

      // Crear una tirada de 3 cartas
      const spread = await spreadRepository.save({
        name: 'Tirada de Tres Cartas',
        description:
          'Una tirada simple pero poderosa que representa el pasado, presente y futuro en relación a una situación o pregunta.',
        cardCount: 3,
        positions: [
          {
            name: 'Pasado',
            description:
              'Representa eventos o influencias del pasado que afectan la situación actual.',
          },
          {
            name: 'Presente',
            description:
              'Muestra la situación actual y las energías que rodean el momento presente.',
          },
          {
            name: 'Futuro',
            description:
              'Indica la dirección hacia donde se dirige la situación si se mantiene el rumbo actual.',
          },
        ],
        imageUrl: 'https://ejemplo.com/tiradas/tres-cartas.jpg',
      });

      console.log(`Tirada "${spread.name}" creada con ID: ${spread.id}`);
    } else {
      console.log(
        `Ya existen ${spreadsCount} tiradas en la base de datos. Saltando creación de tiradas.`,
      );
    }

    console.log('¡Datos iniciales cargados con éxito!');
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
