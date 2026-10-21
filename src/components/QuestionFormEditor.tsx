import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldLabel, FieldGroup } from "./ui/field";
import type { PreparedQuestion } from "../lib/questions";
export function QuestionFormEditor({
  questions,
  onChange,
}: {
  questions: PreparedQuestion[];
  onChange: (questions: PreparedQuestion[]) => void;
}) {
  function update(number: number, patch: Partial<PreparedQuestion>) {
    onChange(
      questions.map((item) =>
        item.number === number ? { ...item, ...patch } : item,
      ),
    );
  }
  return (
    <div className="question-form-editor">
      <FieldGroup>
        {questions.map((item) => (
          <section className="question-edit-card" key={item.number}>
            <div className="question-edit-heading">
              <h3>Frage {item.number}</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Frage ${item.number} löschen`}
                onClick={() =>
                  onChange(
                    questions.filter(
                      (current) => current.number !== item.number,
                    ),
                  )
                }
              >
                <Trash2 />
              </Button>
            </div>
            <Field>
              <FieldLabel htmlFor={`question-text-${item.number}`}>
                Fragetext
              </FieldLabel>
              <Textarea
                id={`question-text-${item.number}`}
                maxLength={1000}
                value={item.text}
                onChange={(event) =>
                  update(item.number, { text: event.target.value })
                }
              />
            </Field>
            <div className="question-edit-answers">
              {item.options.map((option, index) => (
                <div className="question-edit-answer" key={index}>
                  <Field>
                    <FieldLabel
                      className="sr-only"
                      htmlFor={`answer-${item.number}-${index}`}
                    >
                      Frage {item.number}, Antwort{" "}
                      {String.fromCharCode(65 + index)}
                    </FieldLabel>
                    <Input
                      id={`answer-${item.number}-${index}`}
                      maxLength={300}
                      value={option}
                      placeholder={`Antwort ${String.fromCharCode(65 + index)}`}
                      onChange={(event) =>
                        update(item.number, {
                          options: item.options.map((text, i) =>
                            i === index ? event.target.value : text,
                          ),
                        })
                      }
                    />
                  </Field>
                  <label className="correct-answer-checkbox">
                    <Checkbox
                      aria-label={`Frage ${item.number}, Antwort ${String.fromCharCode(65 + index)} richtig`}
                      checked={item.correctOptions?.includes(index) ?? false}
                      onCheckedChange={(checked) =>
                        update(item.number, {
                          correctOptions: checked
                            ? [...(item.correctOptions ?? []), index]
                            : (item.correctOptions ?? []).filter(
                                (i) => i !== index,
                              ),
                        })
                      }
                    />
                    Richtig
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Frage ${item.number}, Antwort ${String.fromCharCode(65 + index)} löschen`}
                    onClick={() =>
                      update(item.number, {
                        options: item.options.filter((_, i) => i !== index),
                        correctOptions: (item.correctOptions ?? [])
                          .filter((i) => i !== index)
                          .map((i) => (i > index ? i - 1 : i)),
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={item.options.length >= 8}
              onClick={() =>
                update(item.number, { options: [...item.options, ""] })
              }
            >
              <Plus data-icon="inline-start" />
              Antwort hinzufügen
            </Button>
          </section>
        ))}
      </FieldGroup>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([
            ...questions,
            {
              number: Math.max(0, ...questions.map((item) => item.number)) + 1,
              text: "",
              options: [],
            },
          ])
        }
      >
        <Plus data-icon="inline-start" />
        Frage hinzufügen
      </Button>
    </div>
  );
}
