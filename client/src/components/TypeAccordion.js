import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import { useAccordionButton } from "react-bootstrap/esm/AccordionButton";
import Unit from "./Unit";

const UnitLoader = ({ eventKey, cost, selected }) => {
  const loadOnClick = useAccordionButton(eventKey, async () => {});
  return (
    <Button
      variant="secondary"
      onClick={loadOnClick}
      size="lg"
      style={{ textAlign: "left" }}
    >
      {selected}{" "}
      <Badge pill bg="warning" text="light">
        {cost ? cost : 0}
      </Badge>
    </Button>
  );
};

const TypeAccordion = ({ cost, units, ord, type, deck, onChange }) => {
  const onSelect = (name) => {
    // alert(`selected ${name}  ${result}`);
    let typeArray = [...deck[type]];
    typeArray[ord] = name;
    onChange(type, typeArray);
  };
  return (
    <Accordion>
      <Card>
        <div className="d-grid gap-2">
          <UnitLoader
            eventKey="0"
            cost={cost}
            selected={deck[type].length > 0 ? deck[type][ord] : ""}
          />
        </div>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            {units.map((u, i) => (
              <Unit name={u.name} key={i} onSelect={onSelect} />
            ))}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default TypeAccordion;
